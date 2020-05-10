const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId;
let DB = undefined

exports.establish_connection = () => {
    if (!process.env.MONGODB_URI) {
        console.error("No MongoDB URI set. Exiting...")
        process.exit(1)
    }

    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {
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
        DB.collection("cookies").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 }).then(() => {
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
            email: userInfo.email,
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
        let query = { authToken: authToken }
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
        let query = { authToken: authToken }
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
        let query = { email: userEmail }
        DB.collection("users").findOne(query, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}


/* ------------------- CRUD Operations for Researcher Form ------------------ */


exports.createForm = (formInfo) => {
    return new Promise((resolve, reject) => {
        DB.collection("researcherForms").insertOne(formInfo, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

exports.getForm = (formId) => {
    return new Promise((resolve, reject) => {
        let query = {
            "_id": ObjectId(formId)
        }
        DB.collection("researcherForms").findOne(query, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

exports.addQuestionToForm = (formData) => {
    let query = {
        "_id": ObjectId(formData.formId)
    }
    let update = ({
        "$push": {
            questions: { "inputType": formData.inputType, "question": formData.question }
        }
    });
    return new Promise((resolve, reject) => {
        DB.collection("researcherForms").updateOne(query, update, (err, res) => {
            if (err) {
                reject(err)
            } else {

                resolve(res)
            }
        })
    })
}

exports.getListOfQuestions = (formId) => {

    let query = {
        "_id": ObjectId(formId)
    }

    return new Promise((resolve, reject) => {
        DB.collection("researcherForms").findOne(query, (err, res) => {
            if (err) {
                reject(err)
            } else {

                resolve(res)
            }
        })
    })
}


exports.postQuestionAnswers = (answers, formId) => {
    return new Promise((resolve, reject) => {
        DB.collection(formId).insertOne(answers, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

exports.seeIfFirstUserEntry = (userID, formId) => {
    let query = {
        "userid": userID
    }
    return new Promise((resolve, reject) => {
        DB.collection(formId).findOne(query, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

exports.getResponses = (formId) => {
    return new Promise((resolve, reject) => {
        DB.collection(formId).find().toArray((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

exports.getSurveys = () => {
    return new Promise((resolve, reject) => {
        DB.collection("researcherForms").find().toArray((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

exports.getSurveysByUserId = (authorid) => {
    let query = {
        "authorid": authorid
    }
    return new Promise((resolve, reject) => {
        DB.collection("researcherForms").find(query).toArray((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}