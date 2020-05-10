/******************************** Dependencies ********************************/
const validator = require('validator')

/****************************** Module Interface ******************************/
/* params is an object mapping names to values, e.g. req.body or req.query 
   validation is an object mapping from names to validation / escape functions
*/
exports.run_validation = (params, validators) => {
    let validatedParams = {}
    for (let field in validators) {
        let validated = ''
        if (!params[field]) {
            throw `Validated field ${field} does not exist`
        }

        try {
            validated = validators[field](params[field])
        } catch(err) {
            throw `Invalid input for field ${field}: ${err}`
        }
        
        validatedParams[field] = validated
    }

    return validatedParams
}

const DEFAULT_MAX_LENGTH = 100
/*
 * escapeFunction returns a safely escaped string or throws on invalid format
 */
exports.build_validator = (escapeFunction, options) => {
    if (!escapeFunction) {throw "escapeFunction must be provided"}
    if (options === undefined) { options = {} }

    let {maxLength, shouldTruncate, isOptional, isObject, isNumber} = options

    if (maxLength) { 
        maxLength = parseInt(maxLength)
        if (maxLength <= 0) {throw "maxLength must be a positive integer"}
    } // else DEFAULT_MAX_LENGTH will be used

    return (fieldValue) => {
        maxLength = maxLength || DEFAULT_MAX_LENGTH
        if (!isOptional && !fieldValue) {
            throw "Value not provided but field is required"
        }

        let escapedValue = escapeFunction(fieldValue) // may throw exception, this is fine

        if (!isObject && !isNumber) { // is string
            if (escapedValue.length > maxLength) {
                if (shouldTruncate) {
                    escapedValue = escapedValue.substring(0, maxLength)
                } else {
                    throw `Length of escapedValue ${escapedValue} exceeds maxLength ${maxLength}`
                }
            }

            if (!isOptional && escapedValue.length === 0) {
                throw `Value has 0 length after escaping but field is required`
            }
        } else if (isObject) { // is parsed JSON
            let parsed = JSON.stringify(escapedValue)
            if (parsed.length > maxLength) {
                throw `Length of JSON ${parsed} exceeds maxLength ${maxLength}`
            }
        } else { // isNumber
            // nothing to do
        }

        return escapedValue
    }
}

/**************** PRE-BUILD VALIDATORS (CAMEL_CAPS Formatting) ****************/
exports.VALIDATE_EMAIL = exports.build_validator(
    (email) => {
        if (!validator.isEmail(email)) {
            throw "Invalid email format"
        }
        return email
    }, 
    {
        maxLength: 75,
        shouldTruncate: false,
        isOptional: false
    })
exports.VALIDATE_RECORD_ID = exports.build_validator(
    (recordID) => {
        if (!exports.is_valid_address(recordID)) {
            throw new Error("Invalid recordID")
        }

        return recordID 
    }, 
    {
        maxLength: 100,
        isOptional: false
    })
const DEFAULT_SURVEY_IDENTIFIERS = ["COVID", "MOOD"]
exports.VALIDATE_SURVEY_ID = exports.build_validator(
    (surveyID) => {
        if (DEFAULT_SURVEY_IDENTIFIERS.includes(surveyID)) return surveyID

        if (!validator.isMongoId(surveyID)) {
            throw new Error("Invalid survey identifier")
        }

        return surveyID 
    }, 
    {
        maxLength: 100,
        isOptional: false
    })
exports.VALIDATE_JSON_10000 = exports.build_validator(
    (surveyResponse) => {
        try {
            let response = JSON.parse(surveyResponse)
        } catch(err) {
            throw new Error("Invalid survey response format")
        }

        return surveyResponse
    }, 
    {
        maxLength: 10000,
        isOptional: false
    })
exports.VALIDATE_ZIP_OR_NA = exports.build_validator(
    (userZIP) => {
        if (typeof userZIP === "string" && userZIP.toLowerCase() === "na") return "NA"

        try {
            parsed = parseInt(userZIP, 10)
            if (parsed <= 9999) throw new Error("Invalid ZIP code format")
            if (parsed > 99999) throw new Error("Invalid ZIP code format")

            return parsed
        } catch(err) {
            throw new Error("Invalid ZIP code format")
        }
    }, 
    {
        maxLength: 5,
        isOptional: false,
        isNumber: true
    })


/************************** Generic validation checks *************************/
exports.is_valid_authToken = (authToken) => {
    if (!authToken) {
        return false
    }

    if ((typeof authToken) !== "string") {
        return false
    }

    if (authToken.length > 100) {
        return false
    }

    return validator.isHexadecimal(authToken)
}  

exports.is_valid_address = (address) => {
    if (!address) return false;

    return (
        validator.isHexadecimal(address) &&
        (address.length == 42 || address.length == 40)
    )
}












