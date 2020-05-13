/* COPYRIGHT 2020 under the MIT License
 * Immuto, Inc
 */
let IN_BROWSER = ("undefined" !== typeof window)

var Web3 = require('web3')
var sigUtil = require('eth-sig-util')
var NodeHTTP = require('xmlhttprequest').XMLHttpRequest // for backend compatability
var NodeForm = require('form-data')                     // for backend compatability
var crypto = require('crypto')

const SYMMETRIC_SCHEME="aes-256-ctr"

function new_HTTP() {
    if (IN_BROWSER) return new XMLHttpRequest()
    else return new NodeHTTP()
}

function new_Form() { // for sending files with XMLHttpRequest
    if (IN_BROWSER) return new FormData()
    else return new NodeForm()
}


let immuto = {} 
const init = function(debug, debugHost) {    
    this.host = "https://www.immuto.io"
    if (debug === true) {
        if (debugHost)
            this.host = debugHost
        else 
            this.host = "https://dev.immuto.io" // reasonable default
    }

    try {
        this.web3 = new Web3("https://www.immuto.io") // Dummy provider because required on init now
    } catch(err) {
        console.error(err)
        throw new Error("Web3js is a required dependency of the Immuto API. Make sure it is included wherever immuto.js is present.")
    }
    
    // for web3 account management
    this.salt = ""
    this.encryptedKey = ""

    // for API acess
    this.authToken = ""
    this.email = ""

    // for Web3 connection (record creation/verification)
    this.connected = false
    let attemptConnection = false

    if (IN_BROWSER) {
        let ls = window.localStorage // preserve session across pages
        if (ls.authToken && ls.email && ls.salt && ls.encryptedKey) {
            this.salt = ls.salt
            this.encryptedKey = ls.encryptedKey
            this.authToken = ls.authToken
            this.email = ls.email
            attemptConnection = true
        }
    }

    this.utils = {
        convert_unix_time: function(time_ms) {
            let time_seconds = time_ms * 1000
            var a = new Date(time_seconds);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes(); 
            var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
            return time;
        },
        emails_to_addresses: (emails) => {
            return new Promise((resolve, reject) => {
                var http = new_HTTP()

                let sendstring = "emails=" + emails + "&authToken=" + this.authToken

                http.open("POST", this.host + "/emails-to-addresses", true)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.onreadystatechange = function() {
                    if (http.readyState === 4 && http.status === 200) {
                        try {
                            let addresses = JSON.parse(http.responseText) 
                            resolve(addresses)
                        } catch (err) {
                            console.error(http.responseText)
                            reject(err)
                        }
                    } else if (http.readyState === 4) {
                        reject(http.responseText)
                    }
                }
                http.send(sendstring)
            })
        },
        addresses_to_emails: (history) => {
            return new Promise((resolve, reject) => {
                let addresses = []
                for (let event of history) {
                    addresses.push(event.signer)
                }

                var http = new_HTTP()

                let sendstring = "addresses=" + JSON.stringify(addresses) + "&authToken=" + this.authToken

                http.open("POST", this.host + "/addresses-to-emails", true)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.onreadystatechange = function() {
                    if (http.readyState === 4 && http.status === 200) {
                        try {
                            let addrToEmail = JSON.parse(http.responseText) 
                            for (let i = 0; i < history.length; i++) {
                                history[i].email = addrToEmail[history[i].signer]
                            }
                            resolve(history)
                        } catch (err) {
                            reject(err)
                        }
                    } else if (http.readyState === 4) {
                        reject(http.responseText)
                    }
                }
                http.send(sendstring)
            })
        },
        ecRecover: (message, v, r, s) => {
            if (v === '28') {
                    v = Buffer.from('1c', 'hex')
            } else {
                    v = Buffer.from('1b', 'hex')
            }
           
            r = Buffer.from(r.split('x')[1], 'hex')
            s = Buffer.from(s.split('x')[1], 'hex')

            let signature = sigUtil.concatSig(v, r, s)
            let address = sigUtil.recoverPersonalSignature({data: message, sig: signature})
            return this.web3.utils.toChecksumAddress(address)
        },
        is_valid_recordID: (ID) => {
            
            if (!ID) return false;
            if ("string" !== typeof ID) return false;

            let idLength = ID.length

            if (40 === idLength || 42 === idLength) {
                // isAddress returns true with or without leading 0x
                // isAddress returns true if ID is a string and false if it's an integer
                return this.web3.utils.isAddress(ID) 
            }
            
            return false
        }
    }

    this.establish_connection = function(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject("Email required for connection")
                return
            }

            var http = new_HTTP()

            let sendstring = "email=" + email.toLowerCase()
            http.open("GET", this.host + "/shard-public-node", true)
            http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            http.onreadystatechange = () => {
                if (http.readyState === 4 && http.status === 200) {
                    let URI = http.responseText
                    try {
                        if (this.connected) {
                            resolve() // concurrent call to this function has already succeeded
                        } else { 
                            this.web3 = new Web3(URI)
                            this.connected = true
                            resolve()
                        }
                    } catch (err) {
                        this.connected = false
                        reject(err)
                    }
                } else if (http.readyState === 4) {
                    reject(http.responseText)
                }
            }
            http.send(sendstring)
        })
    }

    this.establish_manual_connection = function(URI) {
        this.web3 = new Web3(URI)
    }

    if (attemptConnection) {
        // safely concurrent with verification auto-connection calls
        this.establish_connection(this.email)
        .then(() => {}) // no need to do anything
        .catch((err) => {console.error(err)})
    }

    this.get_registration_token = function(address) {
        return new Promise((resolve, reject) => {
            var http = new_HTTP()

            let sendstring = "address=" + address

            http.open("POST", this.host + "/get-signature-data", true)
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

            http.onreadystatechange = () => {
                    if (http.readyState === 4 && http.status === 200) {
                        resolve(http.responseText)
                    } else if (http.readyState === 4) {
                        reject(http.responseText)
                    }
            }
            http.send(sendstring)
        })
    }

    this.register_user = function(email, password, orgToken) {
        return new Promise((resolve, reject) => {
            let salt = this.web3.utils.randomHex(32)
            let account = this.web3.eth.accounts.create()
            let address = account.address
            let encryptedKey = this.web3.eth.accounts.encrypt(account.privateKey, password + salt);

            this.get_registration_token(address).then((token) => {
                let signature = account.sign(token)
                var http = new_HTTP()

                let sendstring = "email=" + email 
                sendstring += "&password=" + this.web3.utils.sha3(password)
                sendstring += "&salt=" + salt
                sendstring += "&address=" + address
                sendstring += "&keyInfo=" + JSON.stringify(encryptedKey)
                sendstring += "&signature=" + JSON.stringify(signature)

                if (orgToken)
                    sendstring += "&registrationCode=" + orgToken

                http.open("POST", this.host + "/submit-registration", true)
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

                http.onreadystatechange = () => {
                    if (http.readyState === 4 && http.status === 204) {
                        resolve()
                    } else if (http.readyState === 4) {
                        reject(http.responseText)
                    }
                }
                http.send(sendstring)
            })
        })
    }

    this.authenticate = function(email, password) {
        return new Promise((resolve, reject) => {
            if (this.salt && this.encryptedKey && this.authToken && this.email) {
                reject("User already authenticated. Call deauthenticate before authenticating a new user.")
                return
            } 

            if (!email) {
                reject("Email required for authentication")
                return
            }
            if (!password) {
                reject("Password required for authentication")
                return
            }

            this.establish_connection(email).then(() => {
                let http = new_HTTP()

                let sendstring = "email=" + email 
                sendstring += "&password=" + this.web3.utils.sha3(password) // server does not see password

                http.open("POST", this.host + "/submit-login", true)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.onreadystatechange = () => {
                    if (http.readyState === 4 && http.status === 200) {
                        let response = JSON.parse(http.responseText)
                        this.salt = response.salt
                        this.encryptedKey = response.encryptedKey
                        this.authToken = response.authToken

                        let account = undefined
                        try {
                            account = this.web3.eth.accounts.decrypt( 
                                this.encryptedKey, 
                                password + this.salt 
                            );
                        } catch(err) {
                            reject("Incorrect password")
                            return
                        }
                        
                        let signature = account.sign(this.authToken)

                        let sendstring = "address=" + account.address
                        sendstring += "&signature=" + JSON.stringify(signature)
                        sendstring += "&authToken=" + this.authToken

                        let http2 = new_HTTP()
                        http2.open("POST", this.host + "/prove-address", true)
                        http2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                        http2.onreadystatechange = () => {
                            if (http2.readyState === 4 && http2.status === 204) {
                                if (IN_BROWSER) {
                                    window.localStorage.authToken = this.authToken
                                    window.localStorage.email = email
                                    window.localStorage.salt = this.salt
                                    window.localStorage.encryptedKey = this.encryptedKey
                                }
                                this.email = email
                                resolve(this.authToken)
                            } else if (http2.readyState === 4) {
                                console.error("Error on login verification")
                                reject(http2.responseText)
                            }
                        }
                        http2.send(sendstring)
                    } else if (http.readyState === 4){
                        console.error("Error on login")
                        reject(http.status + ": " + http.responseText)
                    }
                }
                http.send(sendstring)
            }).catch((err) => {
                console.error(err)
                reject("Could not establish connection to verification server")
            })
        })
    }

    this.deauthenticate = function() {
        return new Promise((resolve, reject) => {
            let sendstring = `authToken=${this.authToken}`

            if (IN_BROWSER) {
                if (!this.authToken) {
                    sendstring = `authToken=${window.localStorage.authToken}`
                }
                window.localStorage.authToken = ""
                window.localStorage.email = ""
                window.localStorage.salt = ""
                window.localStorage.encryptedKey = ""
                window.localStorage.password = "" // in case this is set elsewhere
            }
            this.authToken = ""
            this.email = ""
            this.salt = ""
            this.encryptedKey = ""
            this.connected = false
            
            var http = new_HTTP();
            http.open("POST", this.host + "/logout-API", true);
            http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            http.onreadystatechange = () => {
                if (http.readyState === 4 && http.status === 204) {
                    resolve() 
                } else if (http.readyState === 4) {
                    reject(http.responseText)
                }
            };
            http.send(sendstring);
        })
    }

    // convenience method for signing an arbitrary string
    // user address can be recovered from signature by utils.ecRecover
    this.sign_string = function(string, password) {
        let account = undefined;
        try { 
            account = this.web3.eth.accounts.decrypt(
                this.encryptedKey, 
                password + this.salt
            );

            return account.sign(string)
        } catch(err) {
            if (!this.email) {
                throw new Error("User not yet authenticated.");
            } else {
                throw(err)
            }
        }
    }

    this.generate_key_from_password = function(password) {
        const salt = this.salt
        if (!salt) {
            throw new Error("User must be authenticated to generate key")
        }

        // cannot be SHA256, or Immuto backend could decrypt user data on login with current auth scheme
        const hash = crypto.createHash("sha512")
        hash.update(password + salt);
        return hash.digest().slice(0, 32) // key for aes-256 must be 32 bytes
    }

    this.iv_to_string = function(iv) {
        let str = ""
        for (let i = 0; i < iv.length; i ++) {
            str += iv[i] + ","
        }
        return str
    }

    this.string_to_iv = function(str) {
        let ivStr = str.split(',')

        let iv = new Uint8Array(16)
        for (let i = 0; i < ivStr.length; i++) {
            iv[i] = ivStr[i]
        }

        return iv
    }

    this.encrypt_string_with_key = function(plaintext, key) {
        if (typeof plaintext === "string") {
            plaintext = this.str2ab(plaintext)
        }

        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(SYMMETRIC_SCHEME, key, iv)
        let ciphertext = cipher.update(plaintext, 'binary', 'binary');
        ciphertext += cipher.final('binary');

        return {
            ciphertext: ciphertext,
            key: key,
            iv: iv
        }
    }

    this.encrypt_string_with_password = function(plaintext, password) {
        if (!password) throw new Error("No password provided");

        let key = this.generate_key_from_password(password)
        return this.encrypt_string_with_key(plaintext, key)
    }

    this.encrypt_string = function(plaintext) {
        const key = crypto.randomBytes(32)
        return this.encrypt_string_with_key(plaintext, key)
    }

    this.decrypt_string = function(ciphertext, key, iv) {
        let decipher = crypto.createDecipheriv(SYMMETRIC_SCHEME, key, iv)
        let decrypted = decipher.update(ciphertext, 'binary', 'binary');
        return decrypted + decipher.final('binary');
    }

    this.str2ab = function(str) {
      var buf = new ArrayBuffer(str.length); // 2 bytes for each char
      var bufView = new Uint8Array(buf);
      for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    }

    this.get_file_content = function(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function() {
                resolve(this.result)
            }
            reader.onerror = function(e) {
                reject(e)
            }
            reader.readAsBinaryString(file);
        })
    }

    this.upload_file_for_record = function(file, fileContent, recordID, password, projectID, handleProgress) {
        return new Promise((resolve, reject) => {
            let cipherInfo = this.encrypt_string(fileContent)
            
            let encryptedKey = this.encrypt_string_with_password(
            JSON.stringify({
                key: cipherInfo.key,
                iv: this.iv_to_string(cipherInfo.iv)
            }), password)

            let encryptedFile = new Blob([this.str2ab(cipherInfo.ciphertext)], {type: file.type});
            encryptedFile.lastModifiedDate = new Date();
            encryptedFile.name = file.name;

            var xhr = new XMLHttpRequest();
            let URL =  this.host + "/prepare-file-upload"
            xhr.open("POST", URL, true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let presignedPostData = JSON.parse(xhr.responseText)
                    
                    const formData = new FormData();
                    Object.keys(presignedPostData.fields).forEach(key => {
                      formData.append(key, presignedPostData.fields[key]);
                    });

                    // Actual file has to be appended last
                    formData.append("file", encryptedFile);

                    const http = new XMLHttpRequest();

                    http.open("POST", presignedPostData.url, true);
                    
                    http.onreadystatechange = function() {
                        if (http.readyState === 4 && http.status === 204) {
                            resolve("done")
                        } else if (http.readyState === 4){
                            reject(http.responseText)
                        }
                    };

                    http.upload.onprogress = function(e) {
                        let percentComplete = Math.ceil((e.loaded / e.total) * 100);
                        if (handleProgress) {
                            handleProgress(percentComplete)
                        }
                    };

                    http.send(formData);
                } else if (xhr.readyState === 4) {
                    console.error("Error on upload")
                    reject(xhr.responseText)
                }
            };

            var fd = new_Form()
            fd.append('fileSize', encryptedFile.size)
            fd.append('fileName', file.name)
            fd.append('fileType', file.type)
            fd.append('recordID', recordID)
            fd.append('encryptedKey', encryptedKey.ciphertext)
            fd.append('iv', this.iv_to_string(encryptedKey.iv))
            if (projectID) fd.append('projectID', projectID)
            fd.append('authToken', this.authToken)
            xhr.send(fd);
        })
    }

    this.upload_file = function(file, password, projectID, handleProgress) {
        return new Promise((resolve, reject) => {
            this.get_file_content(file)
            .then((content) => {
                this.create_data_management(content, file.name, "editable", password, "")
                .then((recordID) => {
                    this.upload_file_for_record(file, content, recordID, password, projectID, handleProgress)
                    .then(done => resolve(recordID))
                    .catch(err => reject(err))
                })
                .catch(err => reject(err))
            })
            .catch(err => reject(err))
        })
    }

    this.get_info_for_recordID = function(recordID, versionNumber) {
        return new Promise((resolve, reject) => {
            let accessURL = this.host + "/file-for-recordID?recordID=" + recordID 
            if (versionNumber) {
                accessURL += "&versionNumber=" + (versionNumber - 1) // server indexes by 0
            }
            accessURL += "&authToken=" + this.authToken

            var http = new_HTTP();
            http.open("GET", accessURL, true);
            http.setRequestHeader('Accept', 'application/json, text/javascript');
            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    resolve(JSON.parse(http.responseText))
                } else if (http.readyState === 4 && http.status === 404) {
                    resolve(undefined)
                } else if (http.readyState === 4) {
                    reject(http.responseText)
                }
            };

            http.send()
        })
    }

    this.download_file_for_recordID = function(recordID, password, asPlaintext) {
        return new Promise((resolve, reject) => {
            if (!password) { reject("NO PASSWORD PROVIDED"); return; }
            this.get_info_for_recordID(recordID)
            .then(fileInfo => {
                let decryptKey = this.generate_key_from_password(password)  
                let fileURL = fileInfo.remoteURL
                let encryptedKey = fileInfo.encryptedKey
                let iv = this.string_to_iv(fileInfo.iv)
                
                let fileDecryptInfo = JSON.parse(this.decrypt_string(encryptedKey, decryptKey, iv))  
                
                let fileDKey = fileDecryptInfo.key.data
                let fileDiv = this.string_to_iv(fileDecryptInfo.iv)

                let http = new_HTTP();
                http.open("GET", fileURL, true);
                http.responseType = "arraybuffer"
                http.onreadystatechange = () => {
                    if (http.readyState === 4 && http.status === 200) {
                        let encryptedData = new Uint8Array(http.response)
                        let plaintext = this.decrypt_string(encryptedData, fileDKey, fileDiv) // this can be used for auto-verification (before splitting)

                        let file = {
                            type: fileInfo.type,
                            name: fileInfo.name,
                            data: asPlaintext ? plaintext : this.str2ab(plaintext)
                        }

                        resolve(file)
                    } else if (http.readyState === 4) {
                        console.error(http.response)
                    }
                };

                http.send()
            })
            .catch(err => reject(err))
        })
    }

    this.create_data_management = function(content, name, type, password, desc) {
        return new Promise((resolve, reject) => {

            // Good practice to keep account encrypted unless in use (signing transaction)
            let account = undefined;
            try { 
                account = this.web3.eth.accounts.decrypt(
                    this.encryptedKey, 
                    password + this.salt
                );
            } catch(err) {
                if (!this.email) {
                    reject("User not yet authenticated.");
                } else {
                    reject("User password invalid")
                }
                return;
            }

            let signature = account.sign(content)
            signature.message = "" // Maintain data privacy

            var xhr = new_HTTP();
            let sendstring = ""

            xhr.open("POST", this.host + "/submit-new-data-upload", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText) 
                } else if (xhr.readyState === 4) {
                    reject(xhr.responseText)
                }
            };

            sendstring += 'filename=' + name
            sendstring += '&filedesc=' + desc
            sendstring += '&signature=' + JSON.stringify(signature)
            sendstring += '&type=' + type
            sendstring += '&authToken=' + this.authToken
            xhr.send(sendstring);
        })
    }

    this.update_data_management = function(recordID, newContent, password) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            let account = undefined;
            try {
                account = this.web3.eth.accounts.decrypt(
                    this.encryptedKey, 
                    password + this.salt
                );
            } catch(err) {
                reject(err);
                return;
            }

            this.get_data_management_history(recordID, 'editable').then((history) => {
                let priorHash = history.pop().hash
                let signature = account.sign(newContent + priorHash)
                signature.message = "" // Waste of space to send full message

                var xhr = new_HTTP();
                let sendstring = ""

                xhr.open("POST", this.host + "/update-data-storage", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 204) {
                        resolve()
                    } else if (xhr.readyState === 4) {
                        reject(xhr.responseText)
                    }
                };

                sendstring += 'contractAddr=' + recordID // from submit-new-data-upload
                sendstring += '&signature=' + JSON.stringify(signature)
                sendstring += '&authToken=' + this.authToken
                xhr.send(sendstring);
            }).catch((err) => {
                reject(err)
            })
        })
    }

    this.get_data_management_history = function(recordID, type) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            if (this.connected) { 
                let contract = undefined
                if (type === "basic") {
                    contract = new this.web3.eth.Contract(BASIC_DATA_STORAGE_ABI, recordID);
                } else if (type === "editable") {
                    contract = new this.web3.eth.Contract(EDITABLE_DATA_STORAGE_ABI, recordID);
                } else {
                    reject("Invalid contract type: " + type)
                    return
                }
                
                contract.getPastEvents('Updated', {
                    fromBlock: 0
                })
                .then((events) => {
                    let history = []
                    for (let i = 0; i < events.length; i++) {
                        let event = events[i]
                        history.push({
                            timestamp: this.utils.convert_unix_time(event.returnValues.timestamp),
                            hash: event.returnValues.hash,
                            signer: event.returnValues.updater
                        })
                    }
                    resolve(history)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                if (!this.email) {
                    reject("User not yet authenticated. No email provided.")
                    return
                } else { 
                    this.establish_connection(this.email).then(() => {
                        // this.connected is now true, can safely recurse once
                        this.get_data_management_history(recordID, type).then((history) => {
                            resolve(history)
                        }).catch((err) => {
                            reject(err)
                        })
                    }).catch((err) => {
                        reject("Unable to establish connection")
                    })
                }
            }
        })
    }

    this.verify_data_management = function (recordID, type, verificationContent) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            if (this.web3) { // be more thorough later
                this.get_data_management_history(recordID, type).then((history) => {
                    this.utils.addresses_to_emails(history).then((history) => {
                        for (let i = 0; i < history.length; i++) {
                            let priorHash = ""
                            if (i > 0) 
                                priorHash = history[i - 1].hash

                            let hash = this.web3.eth.accounts.hashMessage(verificationContent + priorHash)
                            if (hash.toLowerCase() === history[i].hash.toLowerCase()) {
                                resolve(history[i])
                                return
                            }
                        }
                        resolve(false)
                    }).catch((err) => {
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            } else {
               reject("Connection to verification server not established. Call establish_connection to setup a connection.")
            }
        })
    }

    this.create_digital_agreement = function(content, name, type, password, signers, desc) {
        return new Promise((resolve, reject) => {
            let account = undefined;
            try {
                account = this.web3.eth.accounts.decrypt(
                    this.encryptedKey, 
                    password + this.salt
                );
            } catch(err) {
                if (!this.email) {
                    reject("User not yet authenticated.");
                } else {
                    reject("User password invalid")
                }
                return;
            }

            let hashedData = this.web3.utils.sha3(content)
            let signature = account.sign(hashedData)
            signature.message = "" // Unnecessary for request

            var xhr = new_HTTP();
            let sendstring = ""

            xhr.open("POST", this.host + "/submit-new-agreement-upload", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText)
                } else if (xhr.readyState === 4) {
                    reject(xhr.responseText)
                }
            };
            sendstring += 'filename=' + name
            sendstring += '&filedesc=' + desc
            sendstring += '&signature=' + JSON.stringify(signature)
            sendstring += '&type=' + type
            if (type === 'multisig')
                    sendstring += '&signers=' + JSON.stringify(signers)
            sendstring += '&fileHash=' + hashedData
            sendstring += '&authToken=' + this.authToken

            xhr.send(sendstring);
        })
    }

    this.sign_digital_agreement = function(recordID, password) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            let account = undefined;
            try {
                account = this.web3.eth.accounts.decrypt(
                    this.encryptedKey, 
                    password + this.salt
                );
            } catch(err) {
                return err;
            }

            var http = new_HTTP()

            let sendstring = "contractAddr=" + recordID 
            sendstring += "&authToken=" + this.authToken 

            http.open("POST", this.host + "/get-contract-info", true)
            http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            http.onreadystatechange = () => {
                if (http.readyState === 4 && http.status === 200) {
                    let response = JSON.parse(http.responseText)

                    let currentHash =  response.hashes.pop()
                    let signature = account.sign(currentHash)
                    signature.message = "" // Unnecessary for request

                    var xhr = new_HTTP();
                    sendstring = ""

                    xhr.open("POST", this.host + "/sign-agreement", true);
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4 && xhr.status === 204) {
                            resolve()
                        } else if (xhr.readyState === 4) {
                            reject(xhr.responseText)
                        }
                    };

                    sendstring += 'contractAddr=' + recordID
                    sendstring += '&signature=' + JSON.stringify(signature)
                    sendstring += '&authToken=' + this.authToken
                    xhr.send(sendstring);
                } else if (http.readyState === 4) {
                    reject(http.responseText)
                }
            }
            http.send(sendstring) 

            
        })

    }

    this.update_digital_agreement = function(recordID, newContent, password) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            let account = undefined;
            try {
                account = this.web3.eth.accounts.decrypt(
                    this.encryptedKey, 
                    password + this.salt
                );
            } catch(err) {
                return err;
            }
            password = undefined

            let dataHash = this.web3.utils.sha3(newContent)
            let signature = account.sign(dataHash)
            signature.message = "" // Unnecessary for request

            var xhr = new_HTTP();
            let sendstring = ""

            xhr.open("POST", this.host + "/update-agreement", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 204) {
                    resolve()
                } else if (xhr.readyState === 4) {
                    reject(xhr.responseText)
                }
            };
            sendstring += 'contractAddr=' + recordID
            sendstring += '&signature=' + JSON.stringify(signature)
            sendstring += '&docHash=' + dataHash
            sendstring += '&authToken=' + this.authToken

            xhr.send(sendstring);
        })

    }

    this.verify_digital_agreement = function(recordID, type, verificationContent) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            if (this.web3) { // be more thorough later
                var http = new_HTTP()

                let sendstring = "contractAddr=" + recordID 
                sendstring += "&authToken=" + this.authToken 

                http.open("POST", this.host + "/get-contract-info", true)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.onreadystatechange = () => {
                    if (http.readyState === 4 && http.status === 200) {
                        let response = JSON.parse(http.responseText)
                        let hashes =  response.hashes
                        let hash = this.web3.utils.sha3(verificationContent)
                        let emails = response.signers
                        if (emails) {
                            this.get_digital_agreement_history(recordID, type).then((history) => {
                                this.utils.emails_to_addresses(JSON.stringify(emails)).then((addresses) => {
                                    let validSignatures = []
                                    addresses.push(response.userAddr)
                                    for (let i = 0; i < addresses.length; i++) {
                                        addresses[i] = addresses[i].toLowerCase()
                                    }
                                    let addressLookup = new Set(addresses)
                                    let currentVersion = 0

                                    for (let i = 0; i < history.length; i++) {
                                        let sig = history[i].signature

                                        //causes extra if original hash correct, rest not
                                        for (let j = currentVersion; j < hashes.length; j++) {
                                            if (j > i) break;
                                            if (hashes[j].toLowerCase() === hash.toLowerCase()) {
                                                let address = this.utils.ecRecover(hash, sig.v, sig.r, sig.s)
                                                if (addressLookup.has(address.toLowerCase())) {
                                                    validSignatures.push({
                                                        version: j,
                                                        timestamp: history[i].timestamp,
                                                        hash: hash,
                                                        signer: address,
                                                        email: history[i]
                                                    })
                                                    break;
                                                } else {
                                                    currentVersion ++
                                                }
                                            }
                                        }
                                    }
                                    if (validSignatures.length > 0) {
                                        this.utils.addresses_to_emails(validSignatures).then((validSignatures) => {
                                            resolve(validSignatures)
                                        }).catch((err) => {
                                            reject(err)
                                        })
                                    }
                                    else {
                                        resolve(false)
                                    }
                                }).catch((err) => {
                                    reject(err)
                                })
                            }).catch((err) => {
                                reject(err)
                            })
                        } else {
                            this.get_digital_agreement_history(recordID, type).then((history) => {
                                let sig = history[0].signature

                                let address = this.utils.ecRecover(hash, sig.v, sig.r, sig.s)
                                this.utils.addresses_to_emails([{signer: address}]).then((emails) => {
                                    if (address.toLowerCase() === response.userAddr.toLowerCase()) {
                                        resolve([{
                                            version: 0,
                                            timestamp: history[0].timestamp,
                                            hash: hash,
                                            signer: address,
                                            email: emails[0].email
                                        }])
                                    } else {
                                        resolve(false)
                                    }
                                }).catch((err) => {
                                    reject(err)
                                })
                            }).catch((err) => {
                                reject(err)
                            })
                        }

                        
                    } else if (http.readyState === 4) {
                        reject(http.responseText)
                    }
                }
                http.send(sendstring) 
            } else {
               reject("Connection to verification server not established. Call establish_connection to setup a connection.")
            }
        })
    }

    this.get_digital_agreement_history = function(recordID, type) {
        return new Promise((resolve, reject) => {
            if (!this.utils.is_valid_recordID(recordID)) {
                reject("Invalid recordID"); return; 
            }

            if (this.connected) { 
                let contract = undefined
                if (type === "single_sign") {
                    contract = new this.web3.eth.Contract(SINGLE_SIGN_AGREEMENT_ABI, recordID);
                } else if (type === "multisig") {
                    contract = new this.web3.eth.Contract(MULTISIG_AGREEMENT_ABI, recordID);
                } else {
                    reject("Invalid contract type: " + type)
                    return
                }
                
                contract.getPastEvents('Signed', {
                    fromBlock: 0,
                    toBlock: 'latest'
                })
                .then((events) => {
                    let history = []
                    for (let i = 0; i < events.length; i++) {
                        let event = events[i]

                        let v = event.returnValues.v
                        let r = event.returnValues.r
                        let s = event.returnValues.s
                        let signature = {v: v, r: r, s: s}

                        history.push({
                            timestamp: this.utils.convert_unix_time(event.returnValues.timestamp),
                            signature: signature
                        })
                    }
                    resolve(history)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                if (!this.email) {
                    reject("User not yet authenticated. No email provided.")
                    return
                } else { 
                    this.establish_connection(this.email).then(() => {
                        // this.connected is now true, can safely recurse once
                        this.get_digital_agreement_history(recordID, type).then((history) => {
                            resolve(history)
                        }).catch((err) => {
                            reject(err)
                        })
                    }).catch((err) => {
                        reject("Unable to establish connection")
                    })
                }
            }
        })
    }
    return this
}


const BASIC_DATA_STORAGE_ABI = [
        {
                "inputs": [
                        {
                                "name": "hash",
                                "type": "bytes32"
                        },
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
        },
        {
                "anonymous": false,
                "inputs": [
                        {
                                "indexed": false,
                                "name": "timestamp",
                                "type": "uint256"
                        },
                        {
                                "indexed": false,
                                "name": "hash",
                                "type": "bytes32"
                        },
                        {
                                "indexed": false,
                                "name": "updater",
                                "type": "address"
                        }
                ],
                "name": "Updated",
                "type": "event"
        }
]

const EDITABLE_DATA_STORAGE_ABI = [
        {
                "constant": false,
                "inputs": [
                        {
                                "name": "hash",
                                "type": "bytes32"
                        },
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "name": "update",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [
                        {
                                "name": "hash",
                                "type": "bytes32"
                        },
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
        },
        {
                "anonymous": false,
                "inputs": [
                        {
                                "indexed": false,
                                "name": "timestamp",
                                "type": "uint256"
                        },
                        {
                                "indexed": false,
                                "name": "hash",
                                "type": "bytes32"
                        },
                        {
                                "indexed": false,
                                "name": "updater",
                                "type": "address"
                        }
                ],
                "name": "Updated",
                "type": "event"
        }
]

const SINGLE_SIGN_AGREEMENT_ABI = [
        {
                "inputs": [
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
        },
        {
                "anonymous": false,
                "inputs": [
                        {
                                "indexed": false,
                                "name": "timestamp",
                                "type": "uint256"
                        },
                        {
                                "indexed": false,
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "indexed": false,
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "indexed": false,
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "name": "Signed",
                "type": "event"
        }
]

const MULTISIG_AGREEMENT_ABI = [
        {
                "constant": false,
                "inputs": [
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "name": "Sign",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [
                        {
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
        },
        {
                "anonymous": false,
                "inputs": [
                        {
                                "indexed": false,
                                "name": "timestamp",
                                "type": "uint256"
                        },
                        {
                                "indexed": false,
                                "name": "v",
                                "type": "uint8"
                        },
                        {
                                "indexed": false,
                                "name": "r",
                                "type": "bytes32"
                        },
                        {
                                "indexed": false,
                                "name": "s",
                                "type": "bytes32"
                        }
                ],
                "name": "Signed",
                "type": "event"
        }
];

immuto.init = init
export default immuto;