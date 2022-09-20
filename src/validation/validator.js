const { default: mongoose } = require("mongoose");
// const ObjectId = require('mongoose').Types.ObjectId

//**    Function for validation    **/

// checking that there is something as input
const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }


// validating that the input must be a non-empty string
const checkString = (value) => { return ((typeof (value) === 'string' && value.trim().length > 0)); }


// function to validate >  name , email , password 
const validateName = (name) => { return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(name)); }
const validateEmail = (email) => { return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)); }
const validatePassword = (password) => { return (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password)); }


// function to check title has specific values or not
const validateTitle = (title) => {
    // way-1
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
    // way-2
    // return (title == ("Mr" || "Mrs" || "Miss")); 
}


// function to check an id is in correct _id format .i.e. is it a hex value or not 
// every ObjectId has a specific format (we saw _id creates automatically and it's unique too )     // _id: creates with a hex value (0-9, a-f)
const validateId = (id) => {
    // way:1
    return mongoose.isValidObjectId(id);
    // way:2 // to do this have to use ln:2
    // return ObjectId.isValid(id)
}

module.exports = { checkInputsPresent, checkString, validateName, validateEmail, validatePassword, validateTitle, validateId}