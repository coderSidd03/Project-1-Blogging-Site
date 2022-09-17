const JWT = require('jsonwebtoken')
const moment = require('moment')
const AuthorModel = require("../models/authorModel")

const Validator = ('../validation/validator.js')



//**     /////////////////////////      CreateAuthor      //////////////////////       **//

const createAuthor = async (req, res) => {
    try {
        let authorDetails = req.body

        // checking anything inputted or not
        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!Validator.checkInputsPresent(authorDetails)) return res.status(404).send({ status: false, msg: "nothing found from body" });

        // destructuring the object we found from body
        let { fname, lname, title, email, password, ...rest } = { ...authorDetails }

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (Validator.checkInputsPresent(rest)) return res.status(404).send({ status: false, msg: "please provide required details only => fname, lname, title, email & password" });

        // checking all the required fields are present or not(sending error msg according to that)
        if (!Validator.checkString(fname)) return res.status(400).send({ status: false, msg: "First name is required [in string] " });
        if (!Validator.checkString(lname)) return res.status(400).send({ status: false, msg: "Last name is required [in string] " });
        if (!Validator.checkString(title)) return res.status(400).send({ status: false, msg: "Title is required [in string] " });
        if (!Validator.checkString(email)) return res.status(400).send({ status: false, msg: "Email is required [in string] " });
        if (!Validator.checkString(password)) return res.status(400).send({ status: false, msg: "Password is required [in string] " });


        // validating all the input are in correct format as we desire 
        if (!Validator.validateName(fname)) return res.status(400).send({ status: false, msg: "First Name format invalid, Please check your First Name" });
        if (!Validator.validateName(lname)) return res.status(400).send({ status: false, msg: "Last Name format invalid, Please check your Last Name" });
        if (!Validator.validateTitle(title)) return res.status(400).send({ status: false, msg: "put title between ['Mr'/ 'Mrs'/ 'Miss'] " });

        if (!Validator.validateEmail(email)) return res.status(400).send({ status: false, msg: "Email format invalid, Please check your Email address" });
        
        // checking that inputted email is not present in any of documents inside authormodel
        let checkEmailPresent = await AuthorModel.findOne({ email: email })
        if (checkEmailPresent) return res.status(400).send({ status: false, msg: "Email already registered, use different emailId" });

        if (!Validator.validatePassword(password)) return res.status(400).send({ status: false, msg: "use a strong password with at least => 1 lowercase alphabetical character => 1 uppercase alphabetical character => 1 numeric character => one special character and password must be eight characters or longer" });


        // creating new author
        let authorCreated = await AuthorModel.create(req.body);
        res.status(201).send({ status: true, data: authorCreated });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}



//**     /////////////////////////      Login author      //////////////////////       **//

const login = async (req, res) => {

    try {

        let credentials = req.body
        let { email, password, ...rest } = { ...credentials }

        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!Validator.checkInputsPresent(credentials)) return res.status(404).send({ status: false, msg: "nothing found from body", required: "email: abc@xyzmail.com , password: abcX@1" });

        // taking EmailId and Password from body and checking both are present
        // as well as in string
        if (!Validator.checkString(email)) return res.status(404).send({ status: false, msg: "please enter EmailId [ in string ] " })
        if (!Validator.checkString(password)) return res.status(404).send({ status: false, msg: "please enter Password [ in string ] " })

        //checking if any other attributes (keys) in req body is present or not (which we don't required)
        if (Validator.checkInputsPresent(rest)) return res.status(404).send({ status: false, msg: "please enter email & password only" });

        // checking that given email is in correct format
        if (!Validator.validateEmail(email)) return res.status(400).send({ status: false, msg: "Please provide an email with valid format " });

        // finding that particular user/author inside AuthorModel  
        let author = await AuthorModel.findOne({ email: email, password: password })
        if (!author) return res.status(404).send({ status: false, result: "no data found", msg: "incorrect emailId or password" });

        // will use this later
        // let author = req.foundDocumentWithCredentials
        // creating token
        let token = JWT.sign(
            {
                userId: Author._id.toString(),
                userName: Author.fname + Author.lname,
                tokenCreationTime: moment().format('DD MM YYYY hh:mm:ss a'),
                type: 'blogging-site-project'
            },
            "-- plutonium-- project-blogging-site -- secret-token --"
        )
        // sending the token in response header
        res.setHeader("x-api-key", token);

        return res.status(201).send({ status: true, msg: "token generation successfull", data: token })
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


module.exports = { createAuthor, login }