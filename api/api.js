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
let ROUTE_VALIDATION = {}
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
    } catch(err) {
      console.error("Error in validation: " + err)
      res.status(400).end(err)
      return
    }

    req.query = {} // prevent access to raw user input
    req.body = {}  // prevent access to raw user input
    req.validated = validatedParams // body values of same name take precendence
    next()
}

function requireAuth(req, res, next) {
  const authToken = auth.get_auth_token(req)
  if (!valid.is_valid_authToken(authToken)) {
    res.status(401).end("Invalid authentication token")
    return
  }

  auth.user_logged_in(req)
  .then(userInfo => {
    if (!userInfo) {
      console.log("Error in require auth")
      res.status(400).end("No user info exists");
      return;
    }
    if (req.body.authToken) { // to prevent hangups in validation
      delete req.body.authToken
    }
    if (req.query.authToken) { // to prevent hangups in validation
        delete req.query.authToken
    }

    req.session = userInfo
    next()
  }).catch((err) => {
      console.error(err)
      res.status(500).end();
  })
}

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8002", "https://immunify.herokuapp.com", "https://immunify.us"]
}))

function today_as_string() {
  let today = new Date();
  let dd = String(today.getUTCDate()).padStart(2, '0');
  let mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`
}

/************************************ API *************************************/
app.get('/user-info', requireAuth, (req, res) => {
  DB.get_user_info(req.session.email)
  .then(userInfo => res.json(userInfo))
  .catch(err => {
    console.error(err)
    res.status(500).end("Failed to get user information")
  })
})

ROUTE_VALIDATION['/survey-info'] = { // may be worth adding individually before each route
  'surveyID': valid.VALIDATE_SURVEY_ID,
}
app.get('/survey-info', requireAuth, validateInput, (req, res) => {
  DB.get_survey_info(req.validated.surveyID)
  .then(surveyInfo => res.json(surveyInfo))
  .catch(err => {
    console.error(err)
    res.status(500).end()
  })
})

ROUTE_VALIDATION['/set-profile-info'] = { // may be worth adding individually before each route
  'recordID': valid.VALIDATE_RECORD_ID
}
app.post('/set-profile-info', requireAuth, validateInput, (req, res) => {
  DB.set_profile_info(req.session.email, req.validated.recordID)
  .then(result => res.status(204).end())
  .catch(err => {
    console.error(err)
    res.status(500).end("Failed to set user profile information")
  })
})

ROUTE_VALIDATION['/record-survey-response'] = { // may be worth adding individually before each route
  'recordID': valid.VALIDATE_RECORD_ID,
  'surveyID': valid.VALIDATE_SURVEY_ID,
  'surveyResponse': valid.VALIDATE_JSON_10000,
  'userZIP': valid.VALIDATE_ZIP_OR_NA
}
app.post('/record-survey-response', requireAuth, validateInput, async (req, res) => { 
  let { recordID, surveyID, surveyResponse, userZIP } = req.validated
  surveyResponse = JSON.parse(surveyResponse)
  const today = today_as_string()

  try {
    const userInfo = await DB.get_user_info(req.session.email)
    const surveyInfo = await DB.get_survey_info(surveyID)
    
    const lastUpdate = userInfo[surveyID]
    if (lastUpdate === today) {
      res.status(400).end("A survey response was already recorded for today");
      return;
    }

    surveyResponse.pop() // remove date, to be added back later
    if (surveyResponse.length !== surveyInfo.questions.length) {
        res.status(400).end("All questions must be answered");
        return;
    }
    surveyResponse.map((responses, rIndex) => {
      const validAnswers = surveyInfo.questions[rIndex].answers
      if (responses.length === 0) {
          res.status(400).end(`No response provided for question ${rIndex + 1}`)
          return
      }

      for (let response of responses) {
        if (!validAnswers.includes(response)) {
          res.status(400).end(`Invalid response for question ${rIndex + 1}: ${response}`)
          return
        }
      }
    })
    surveyResponse.push(today_as_string())

    surveyResponse.push(userZIP)
    let update = await DB.add_response_for_survey(surveyID, surveyResponse)
    let userUpdate = await DB.update_user_response(
      req.session.email, 
      surveyID, 
      today, 
      surveyInfo.pointValue,
      recordID
    )

    res.status(204).end()
  } catch(err) {
    console.error(err)
    res.status(500).end()
  }
})

// Registration and auth

ROUTE_VALIDATION['/register-org-user'] = { // may be worth adding individually before each route
  'email': valid.VALIDATE_EMAIL
}
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
      let userInfo = {email}

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
      app.listen(PORT, function() {
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
schedule.scheduleJob('0 */6 * * *', function() { 
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
process.on("SIGINT", function() {
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

/***************************** Utility Functions ******************************/
function user_logged_in_immuto(authToken) {
  return new Promise((resolve, reject) => {
    var http = new XMLHttpRequest();

    let sendstring = "authToken=" + authToken;
    http.open("POST", IMMUTO_HOST + "/verify-user-authentication", true);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    http.onreadystatechange = () => {
      if (http.readyState === 4 && http.status === 200) {
        try {
          let userInfo = JSON.parse(http.responseText);
          resolve(userInfo);
        } catch (err) {
          reject(err);
        }
      } else if (http.readyState === 4) {
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