let url = "http://localhost:8001"
if (window.location.href.includes("herokuapp.com")) {
  url = "https://immunify-api.herokuapp.com"
} else if (!window.location.href.includes("localhost")) {
  url = "https://immunify-api.herokuapp.com" // can change to api.immunify.us when ready
}

export const API_URL = url

let iURL = "https://dev.immuto.io" // constant 
if (window.location.href.includes("herokuapp.com")) {
    // leave as dev for now
} else if (!window.location.href.includes("localhost")) {
    // leave as dev for now
}

export const IMMUTO_URL = iURL

export function get_user_info(authToken : string) {
  authToken = authToken || window.localStorage.authToken
  return new Promise((resolve, reject) => {
    let url = `${API_URL}/user-info?authToken=${authToken}`;
    fetch(url, {})
    .then(res => res.json())
    .then(
      (result) => {
        resolve(result)
      },
      (err) => {
        reject(err)
      })
  })
}