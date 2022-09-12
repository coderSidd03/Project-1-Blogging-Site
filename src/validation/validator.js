const { default: mongoose } = require("mongoose");
const authorModel = require("../models/authorModel");

// declaring the ObjectId types of mongoose 
const ObjectId = require('mongoose').Types.ObjectId

//**    Function for validation    **/

// checking that there is something as input
const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }

// validating that the input must be a non-empty string
const checkString = (value) => { return ((typeof (value) === 'string' && value.length > 0)); }


// function to validate >  name , email , password 
const validateName = (name) => { return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(name)); }

const validateEmail = (email) => { return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)); }

const validatePassword = (password) => { return (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password)); }

// function to check title has specific values or not
const validateTitle = (title) => { return (title == ("Mr" || "Mrs" || "Miss")); }

// function to check an id is in correct _id format .i.e. is it a hex value or not 
// every ObjectId has a specific format (we saw _id creates automatically and it's unique too )     // _id: creates with a hex value (0-9, a-f)
const validateId = (id) => {
    // way:1
    return mongoose.isValidObjectId(id);
    // way:2 // to do this have to use ln:5
    // return ObjectId.isValid(id)
}

//**>>>>>>>>>>>>>>>>>>>>    AUTHOR VALIDATION    **///////////////////////

const validateAuthor = async (req, res, next) => {

    try {
        let authorDetails = req.body
        // destructuring the object we found from body
        let { fname, lname, title, email, password, ...rest } = { ...authorDetails }

        // checking anything inputted or not
        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!checkInputsPresent(authorDetails)) return res.status(404).send({ status: false, msg: "nothing found from body" });

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (checkInputsPresent(rest)) return res.status(404).send({ status: false, msg: "please provide required details only => fname, lname, title, email & password" });

        // checking all the required fields are present or not(sending error msg according to that)
        if (!checkString(fname)) return res.status(400).send({ status: false, msg: "First name is required [in string] " });
        if (!checkString(lname)) return res.status(400).send({ status: false, msg: "Last name is required [in string] " });
        if (!checkString(title)) return res.status(400).send({ status: false, msg: "Title is required [in string] " });
        if (!checkString(email)) return res.status(400).send({ status: false, msg: "Email is required [in string] " });
        if (!checkString(password)) return res.status(400).send({ status: false, msg: "Password is required [in string] " });


        // validating all the input are in correct format as we desire 
        if (!validateName(fname)) return res.status(400).send({ status: false, msg: "First Name format invalid, Please check your First Name" });
        if (!validateName(lname)) return res.status(400).send({ status: false, msg: "Last Name format invalid, Please check your Last Name" });
        if (!validateTitle(title)) return res.status(400).send({ status: false, msg: "put title between ['Mr'/ 'Mrs'/ 'Miss'] " });

        if (!validateEmail(email)) return res.status(400).send({ status: false, msg: "Email format invalid, Please check your Email address" });
        // checking that inputted email is not present in any of documents inside authormodel
        let checkEmailPresent = await authorModel.findOne({ email: email })
        if (checkEmailPresent) return res.status(400).send({ status: false, msg: "Email already registered, use different emailId" });

        if (!validatePassword(password)) return res.status(400).send({ status: false, msg: "use a strong password with at least => 1 lowercase alphabetical character => 1 uppercase alphabetical character => 1 numeric character => one special character and password must be eight characters or longer" });

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**>>>>>>>>>>>>>>>>>>>>    BLOG VALIDATION    **///////////////////////

const validateBlog = async (req, res, next) => {

    try {
        // taking data from body
        let blogData = req.body
        // using destructuring of object (as we get data as json obj from postman), using ...rest to add all of the rest of the fields (which we need at the time of cretaion new doc)
        // here we defining the key name we are getting from body and then we can call them with this defined name
        let { title, body, authorId, category, isPublished, tags, subcategory, ...rest } = { ...blogData }

        //checking that there is data inside body
        if (!checkInputsPresent(blogData)) return res.status(404).send({ status: false, msg: "please provide details to create a blog" })

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (checkInputsPresent(rest)) return res.status(400).send({ status: false, msg: "please provide required details only => title, body, authorId, category, isPublished " });

        // checking all the required fields are present or not(sending error msg according to that)
        if (!checkString(title)) return res.status(400).send({ status: false, msg: "Title is required [ in string ] " });
        if (!checkString(body)) return res.status(400).send({ status: false, msg: "Body is required [ in string ] " });
        if (!checkString(authorId)) return res.status(400).send({ status: false, msg: "AuthorId is required [ in string ] " });
        if (!category) return res.status(400).send({ status: false, msg: "Category is required [ in array of strings ] " });

        // checking that the authorId which is given is that in a perfect _id format .i.e. is it a hex value or not 
        // every ObjectId has a specific format (we saw _id creates automatically and it's unique too )     // _id: creates with a hex value (0-9, a-f)
        if (!validateId(authorId)) return res.status(400).send({ status: false, msg: "AuthorId is invalid" });

        //finding by authorId
        const validateAuthorId = await AuthorModel.findById(authorId);
        //check valid authorId
        if (!validateAuthorId) return res.status(400).send({ status: false, msg: "Author is not present, create author first" });

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**>>>>>>>>>>>>>>>>>>>>    LOGIN VALIDATION    **///////////////////////

const validateLoginCredentials = async (req, res, next) => {
    
    try {
        let credentials = req.body
        let { email, password, ...rest } = { ...credentials }
        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!checkInputsPresent(credentials)) return res.status(404).send({ status: false, msg: "nothing found from body", required: "email: abc@xyzmail.com , password: abcX@1" });

        //checking if any other attributes (keys) in req body is present or not (which we don't required)
        if (checkInputsPresent(rest)) return res.status(404).send({ status: false, msg: "please enter email & password only" });

        // taking EmailId and Password from body and checking both are present
        // as well as in string
        if (!checkString(email)) return res.status(404).send({ status: false, msg: "please enter EmailId [ in string ] " })
        if (!checkString(password)) return res.status(404).send({ status: false, msg: "please enter Password [ in string ] " })

        // checking that given email is in correct format
        if (!validateEmail(email)) return res.status(400).send({ status: false, msg: "Please provide an email with valid format " });

        // finding that particular user/author inside AuthorModel  
        let author = await AuthorModel.findOne({ email: email, password: password })
        if (!author) return res.status(404).send({ status: false, result: "no data found", msg: "incorrect emailId or password" });

        req.foundDocumentWithCredentials = author

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


module.exports = { checkInputsPresent, checkString, validateName, validateEmail, validatePassword, validateTitle, validateId }