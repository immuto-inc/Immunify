const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
let DB = undefined

exports.establish_connection = () => {
    if (!process.env.MONGODB_URI) {
        console.error("No MongoDB URI set. Exiting...")
        process.exit(1)
    }

    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
            if (!err) {
                DB = client.db() 
                add_TTL_indices().then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            } else {
                reject(err)
            }
        });
    })
}

function add_TTL_indices() {
    return new Promise((resolve, reject) => {
        console.log("Adding TTL indices")
        DB.collection("cookies").createIndex({"createdAt": 1}, {expireAfterSeconds: 86400}).then(() => {
            console.log("cookies TTL successful")
             resolve()
        }).catch((err) => {
            console.error("Failed to check or create cookies TTL index: ")
            reject(err)
        })
    })
}

exports.add_session = (authToken, userInfo) => {
    return new Promise((resolve, reject) => {
        let query = {
            createdAt: new Date(),
            email: userInfo.email.toLowerCase(), 
            address: userInfo.userAddr,
            authToken: authToken
        }
        DB.collection("cookies").insertOne(query, (err, user) => {
            if (err) {
                reject(err)
            } else {
                resolve(user)
            }
        })
    })
}

exports.delete_session = (authToken) => {
    return new Promise((resolve, reject) => {
        let query = {authToken: authToken}
        DB.collection("cookies").removeOne(query, (err, user) => {
            if (err) {
                reject(err)
            } else {
                resolve(user)
            }
        })
    })
}

exports.get_user_session = (authToken) => {
    return new Promise((resolve, reject) => {
        let query = {authToken: authToken}
        DB.collection("cookies").findOne(query, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}

exports.add_new_user = (userInfo) => {
    return new Promise((resolve, reject) => {
        DB.collection("users").insertOne(userInfo, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

exports.get_user_info = (userEmail) => {
    return new Promise((resolve, reject) => {
        let query = {email: userEmail.toLowerCase()}
        DB.collection("users").findOne(query, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}

exports.set_profile_info = (userEmail, recordID) => {
    return new Promise((resolve, reject) => {
        let update = { $set: {profileInfo: recordID}, $inc: { score: 100 } }
        let query = {email: userEmail.toLowerCase(), profileInfo: { $exists: false} }
        DB.collection("users").updateOne(query, update, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}

exports.update_user_response = (userEmail, surveyID, today, points, recordID) => {
    return new Promise((resolve, reject) => {
        let setIdToToday = {}
        setIdToToday[surveyID] = today

        let pushRecordID = {}
        pushRecordID[surveyID + "_transactions"] = recordID 

        let update = { 
            $set: setIdToToday, 
            $inc: { score: points },
            $push: pushRecordID
        }
        let query = {email: userEmail.toLowerCase(), profileInfo: { $exists: true} }
        DB.collection("users").updateOne(query, update, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}

const covidCheckinSurvey = {
  title: "Daily COVID Check-in",
  pointValue: 250,
  type: "medical",
  questions: [
    {
      questionText: "Select any symptoms you've experienced within the last 24h",
      answers: ["Coughing",
                "Fever",
                "Loss of taste or smell",
                "Muscle aches",
                "Shortness of breath",
                "None or Other"
      ],
      type: "checkbox"
    }
  ],
  identifier: "COVID"
}

const moodCheckinSurvey = {
  title: "Daily Mood Check-in",
  pointValue: 250,
  type: "mood",
  questions: [
    {
      questionText: "Select any options which describe today's mood",
      answers: ["Anxiety", 
                "Gratitude",
                "Happiness", 
                "Loneliness",
                "Positivity", 
                "Sadness", 
                "Stress", 
                "None or Other",
      ],
      type: "checkbox"
    }
  ],
  identifier: "MOOD"
}
exports.get_survey_info = (surveyID) => {
    return new Promise((resolve, reject) => {
        if (surveyID === "MOOD") {
            resolve(moodCheckinSurvey); return;
        }
        if (surveyID === "COVID") {
            resolve(covidCheckinSurvey); return;
        }

        const _id = new ObjectId(surveyID)
        const query = {_id}
        DB.collection("surveys").findOne(query, (err, surveyInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(surveyInfo)
            }
        })
    })
}

exports.add_response_for_survey = (surveyID, response) => {
    return new Promise((resolve, reject) => {
        const query = {surveyID}
        const update = {
            $push: {responses: response}
        }
        DB.collection("survey_responses").updateOne(query, update, (err, updateResult) => {
            if (err) {
                reject(err)
            } else {
                resolve(updateResult)
            }
        })
    })
}


exports.get_survey_responses = (surveyID) => {
    return new Promise((resolve, reject) => {
        const query = {surveyID}
        DB.collection("survey_responses").findOne(query, (err, surveyRes) => {
            if (err) {
                reject(err)
            } else {
                resolve(surveyRes.responses)
            }
        })
    })
}




