let URL = "http://localhost:8001"
if (window.location.href.includes("herokuapp.com")) {
  URL = "https://immunify-api.herokuapp.com"
} else if (!window.location.href.includes("localhost")) {
  URL = "https://immunify-api.herokuapp.com" // can change to api.immunify.us when ready
}

export const API_URL = URL

let iURL = "https://dev.immuto.io" // constant 
if (window.location.href.includes("herokuapp.com")) {
    // leave as dev for now
} else if (!window.location.href.includes("localhost")) {
    // leave as dev for now
}

export const IMMUTO_URL = iURL
