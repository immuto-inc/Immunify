const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const immuto = require("immuto-backend");
var schedule = require('node-schedule');
const cors = require("cors");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//const crypto = require('crypto')
const cluster = require('cluster')

/* Project Modules */
const auth = require(path.join(__dirname, "modules", "authentication.js"));
const DB = require(path.join(__dirname, "modules", "database.js"));
const valid = require(path.join(__dirname, "modules", "validation.js"))

if (process.env.MODE !== "PROD") {
  console.warn("Running in test/debug mode");
}
const MODE = process.env.MODE === "PROD" ? "PROD" : "DEV"

const DEFAULT_PORT = 8001;
const IMMUTO_HOST = MODE === "PROD" ? "https://www.immuto.io" : "https://dev.immuto.io";

let app = express();
let im = immuto.init(true, IMMUTO_HOST); // leave blank for production use

app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.use(cors()); 

/******************************* Website Pages ********************************/
app.get('/', (req, res) => res.status(200).end("API Online!"));


/********************************* MIDDLEWARE *********************************/
const ROUTE_VALIDATION = { // may be worth changing from const to let, vvvvv
  '/register-org-user': { // may be worth adding individually before each route
    'email': valid.VALIDATE_EMAIL
  }
}
function validateInput(req, res, next) {
  const path = req.path
  let validators = ROUTE_VALIDATION[path]
  if (validators === undefined) {
    console.error(`Params or validators undefined for route ${path}`)
    res.status(500).end()
    return
  }

  let fields = []
  for (let field in validators) {
    fields.push(field)
  }

  let params = {}
  for (let qField in req.query) {
    if (!fields.includes(qField)) {
      console.error(`Query ${qField} has no validation in route ${path}`)
      res.status(500).end(`Unexpected field: ${qField} in query`)
      return
    }
    params[qField] = req.query[qField]
  }

  // could check for same-name fields here, but currently default to overwrite
  for (let bField in req.body) {
    if (!fields.includes(bField)) {
      console.error(`Body ${bField} has no validation in route ${path}`)
      res.status(500).end(`Unexpected field: ${bField} in body`)
      return
    }
    params[bField] = req.body[bField]
  }

  let validatedParams = {}
  try {
    validatedParams = valid.run_validation(params, validators)
  } catch (err) {
    res.status(400).end(err)
    return
  }

  req.query = {} // prevent access to raw user input
  req.body = {}  // prevent access to raw user input
  req.validated = validatedParams // body values of same name take precendence
  next()
}

function requireAuth(req, res, next) {
  const authToken = auth.get_auth_token()
  if (!valid.is_valid_authToken(authToken)) {
    res.status(401).end("Invalid authentication token")
    return
  }

  auth.user_logged_in(req)
    .then(userInfo => {
      if (!userInfo) {
        res.status(400).end("No user info exists");
        return;
      }

      next()
    }).catch((err) => {
      console.error(err)
      res.status(500).end();
    })
}

app.use(cors({
  origin: ["http://localhost:3000", "https://immunify.herokuapp.com", "https://immunify.us"]
}))

/************************************ API *************************************/
app.post("/register-org-user", validateInput, (req, res) => {
  let email = req.validated.email;

  var http = new XMLHttpRequest();
  let sendstring = "email=" + email.toLowerCase();
  sendstring += "&noEmail=true"; // Causes API to respond with authToken rather than emailing user
  sendstring += "&authToken=" + im.authToken; // org admin authToken for permissioning new user registration
  http.open("POST", IMMUTO_HOST + "/submit-org-member", true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.onreadystatechange = () => {
    if (http.readyState == 4 && http.status == 200) {
      let regToken = http.responseText;
      let userInfo = { email }

      DB.add_new_user(userInfo)
        .then(() => {
          res.end(regToken);
        })
        .catch(err => {
          console.error(err);
          res.status(500).end();
        });
    } else if (http.readyState == 4) {
      res.status(http.status).end(http.responseText);
    }
  };
  http.send(sendstring);
});

app.post("/login-user", (req, res) => {
  user_logged_in_immuto(req.body.authToken)
    .then(userInfo => {
      if (!userInfo) {
        res.status(403).end();
        return;
      }

      DB.get_user_info(userInfo.email)
        .then(immunifyInfo => {
          if (immunifyInfo) {
            auth.create_user_session(req.body.authToken, userInfo, res)
              .then(() => {
                res.status(204).end();
              })
              .catch(err => {
                console.error(err);
                res.status(500).end("Internal error."); // more info if appropriate
              });
          } else {
            res.status(403).end("An Immunify account does not exist with that email.");
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).end();
        });
    })
    .catch(err => {
      console.error(err)
      if (err.code && err.code == 403) {
        res.status(403).end("Unauthorized.");
      } else {
        res.status(500).end("Internal error."); // more info if appropriate
      }
    });
});

app.post("/logout", (req, res) => {
  console.log("logout post")
  auth
    .end_user_session(req)
    .then(() => {
      res.status(204).end()
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});



/********************************* APP START **********************************/
let cred = get_credentials();

console.log("Authenticating admin Immuto account.");
im.authenticate(cred.email, cred.password)
  .then(() => {
    // authentication lasts 24 hours
    console.log("Authentication successful.");
    DB.establish_connection()
      .then(() => {
        start_server()
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error("Error authenticating admin Immuto account:");
    console.error(err);
  });

function start_server() {
  if (cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = process.env.WEB_CONCURRENCY || require('os').cpus().length || 1;
    if (MODE !== "PROD") { // limit to two workers in dev / test
      cpuCount = cpuCount > 2 ? 2 : 1
    }

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
      cluster.fork();
    }

  } else {
    const PORT = process.env.PORT || DEFAULT_PORT
    app.listen(PORT, function () {
      console.log(`Worker ${cluster.worker.id} running on port: ${PORT}`)
    });

    app.get("/worker-test", (req, res) => {
      res.end(`Worker ${cluster.worker.id} online!`)
    })


    // 404 Handling
    app.get('*', (req, res) => {
      res.status(404).end("Page not found")
    });
  }

  // Listen for dying workers
  cluster.on('exit', function (worker) {
    console.error(`Worker ${worker.id} died`);
    im.deauthenticate()
      .then(() => {
        console.log("Successfully logged out of Immuto on worker death");
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        cluster.fork();
      })
  });
}

// Reauthenticate periodicatlly
// runs ``At minute 0 past every 6th hour''
schedule.scheduleJob('0 */6 * * *', function () {
  im.deauthenticate()
    .then(() => {
      im.authenticate(cred.email, cred.password)
        .then(() => {
          console.log("Re-Authentication to Immuto successful.");
        })
        .catch(err => {
          console.error("Error authenticating admin Immuto account:");
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
      process.exit();
    });

});

// Deauthenticate on server shutdown
process.on("SIGINT", function () {
  im.deauthenticate()
    .then(() => {
      console.log("Successfully logged out of Immuto before exiting!");
      process.exit();
    })
    .catch(err => {
      console.error(err);
      process.exit();
    });
});


/* ------------------------ Researcher Form Endpoints ----------------------- */
// Researcher can create a new form
app.post('/createForm', (req, res) => {
  let formId
  DB.createForm(req.body)
    .then((response) => {
      formId = response.ops[0]._id
      res.send(formId);
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

// Researcher can see see the form they are working on while adding to it
app.get("/addToForm", (req, res) => {
  DB.getForm(req.query.formId)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

// Researcher can add a new question to their form
app.post("/addToForm", (req, res) => {
  DB.addQuestionToForm(req.body, req.query.id)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

// Researcher can see what their form will look like in production
app.get("/previewForm", (req, res) => {
  DB.getListOfQuestions(req.query.formId)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})


// User can submit a reponse to the researcher's form
// There should be some validation here!
app.post("/userSubmit", async (req, res) => {
  let breakNow = false

  // Checks if user already submitted to this form
  await DB.seeIfFirstUserEntry(req.body.userid, req.query.formId)
    .then((response) => {
      if (response != null) {
        breakNow = true
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });

  if (breakNow) {
    res.send("Already Submitted")
    return
  }

  // If not, the answers get posted to the form's collection
  DB.postQuestionAnswers(req.body, req.query.formId)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})


// Researcher can see the responses to the forms they created
app.get("/responses", (req, res) => {
  DB.getResponses(req.query.formId)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

// User can browse forms created by researchers
app.get("/browse", (req, res) => {
  DB.getSurveys()
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

// Researchers can view a list of all of the forms they have created
app.get("/researcherSurveys", (req, res) => {
  DB.getSurveysByUserId(req.query.authorid)
    .then((response) => {
      res.send(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
})

/***************************** Utility Functions ******************************/
function user_logged_in_immuto(authToken) {
  return new Promise((resolve, reject) => {
    var http = new XMLHttpRequest();

    let sendstring = "authToken=" + authToken;
    http.open("POST", IMMUTO_HOST + "/verify-user-authentication", true);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    http.onreadystatechange = () => {
      if (http.readyState == 4 && http.status == 200) {
        try {
          let userInfo = JSON.parse(http.responseText);
          resolve(userInfo);
        } catch (err) {
          reject(err);
        }
      } else if (http.readyState == 4) {
        let response = {
          responseText: http.responseText,
          code: http.status
        };
        reject(response);
      }
    };
    http.send(sendstring);
  });
}

function get_credentials() {
  let credentials = {};
  if (process.env.EMAIL && process.env.PASSWORD) {
    credentials.email = process.env.EMAIL;
    credentials.password = process.env.PASSWORD;
    return credentials;
  } else {
    console.error("You must set EMAIL and PASSWORD env variables.");
    process.exit();
  }
}



