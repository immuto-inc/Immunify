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

    let {maxLength, shouldTruncate, isOptional, isObject} = options

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


        if (!isObject) { // is string
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
        } else { // is parsed JSON
            let parsed = JSON.stringify(escapedValue)
            if (parsed.length > maxLength) {
                throw `Length of JSON ${parsed} exceeds maxLength ${maxLength}`
            }
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













