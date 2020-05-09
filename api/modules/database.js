const MongoClient = require('mongodb').MongoClient
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
        let query = {email: userEmail}
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
        let query = {email: userEmail, profileInfo: { $exists: false} }
        DB.collection("users").updateOne(query, update, (err, userInfo) => {
            if (err) {
                reject(err)
            } else {
                resolve(userInfo)
            }
        })
    })
}









