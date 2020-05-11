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

export function get_user_info(authToken) {
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

export function get_survey_info(authToken, surveyID) {
  return new Promise((resolve, reject) => {
    authToken = authToken || window.localStorage.authToken
    let url = `${API_URL}/survey-info?authToken=${authToken}`;
    url += "&surveyID=" + surveyID
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

export function today_as_string() {
  let today = new Date();
  let dd = String(today.getUTCDate()).padStart(2, '0');
  let mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`
}

// adapted from https://javascript.info/task/get-seconds-to-tomorrow
export function time_until_survey_reset() {
  let now = new Date();
  let nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  let tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1);

  let diff = tomorrow - nowUTC; // difference in ms

  let hours = Math.floor(diff / 3600000)
  let minutes = Math.ceil((diff - hours * 3600000) / 60000)
  return `${hours} hours ${minutes} minutes`
}
