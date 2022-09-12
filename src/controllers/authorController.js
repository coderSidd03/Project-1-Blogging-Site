const JWT = require('jsonwebtoken')
const moment = require('moment')
const AuthorModel = require("../models/authorModel")
// const = require("../controllers/)


// Defined Some Globally used functions

const checkInputs = (value) => { return (Object.keys(value).length > 0); }

const isValidInput = (value) => { return ((typeof (value) === 'string' && value.length > 0)); }


//**     /////////////////////////      CreateAuthor      //////////////////////       **//

const createAuthor = async (req, res) => {
    try {
        // checking anything inputted or not
        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!checkInputs(author)) return res.status(404).send({ status: false, msg: "nothing found from body" });

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (checkInputs(rest)) return res.status(404).send({ status: false, msg: "please provide required details only => fname, lname, title, email & password" });

        // checking all the required fields are present or not(sending error msg according to that)
        if (!isValidInput(fname)) return res.status(400).send({ status: false, msg: "First name is required [in string] " });
        if (!isValidInput(lname)) return res.status(400).send({ status: false, msg: "Last name is required [in string] " });

        if (!isValidInput(title)) return res.status(400).send({ status: false, msg: "Title is required [in string] " });
        if (title != ("Mr" || "Mrs" || "Miss")) return res.status(400).send({ status: false, msg: "put title between ['Mr'/ 'Mrs'/ 'Miss'] " });

        if (!isValidInput(email)) return res.status(400).send({ status: false, msg: "Email is required [in string] " });
        if (!isValidInput(password)) return res.status(400).send({ status: false, msg: "Password is required [in string] " });


        // validating fields with REGEX formats
        let regexName = /^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i
        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

        if (!regexName.test(fname)) return res.status(400).send({ status: false, msg: "First Name format invalid, Please check your First Name" });
        if (!regexName.test(lname)) return res.status(400).send({ status: false, msg: "Last Name format invalid, Please check your Last Name" });
        if (!regexEmail.test(email)) return res.status(400).send({ status: false, msg: "Email format invalid, Please check your Email address" });
        if (!regexPassword.test(password)) return res.status(400).send({ status: false, msg: "use a strong password with at least => 1 lowercase alphabetical character => 1 uppercase alphabetical character => 1 numeric character => one special character and password must be eight characters or longer" });


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
        let { email, password, ...rest } = req.body
        // as empty object gives truthy value , so we declarin if there is no keys return nothing found
        if (!checkInputs(credentials)) return res.status(404).send({ status: false, msg: "nothing found from body" });

        //checking if any other attributes (keys) in req body is present or not (which we don't required)
        if (checkInputs(rest)) return res.status(404).send({ status: false, msg: "please enter email & password only" });

        // taking EmailId and Password from body and checking both are present
        if (!email && !password) return res.status(404).send({ status: false, msg: "please enter EmailId and Password" })
        if (!isValidInput(email)) return res.status(404).send({ status: false, msg: "please enter EmailId [ in string ] " })
        if (!isValidInput(password)) return res.status(404).send({ status: false, msg: "please enter Password [ in string ] " })

        // checking that given email is in correct format
        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!regexEmail.test(email)) return res.status(400).send({ status: false, msg: "Please provide an email with valid format " });

        // finding that particular user/author inside AuthorModel  
        let Author = await AuthorModel.findOne({ email: email, password: password })
        if (!Author) return res.status(404).send({ status: false, msg: "incorrect emailId or password" });

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

        return res.status(201).send({ status: true, data: token })
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


module.exports = { createAuthor, login }