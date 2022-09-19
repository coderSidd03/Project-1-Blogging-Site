const JWT = require('jsonwebtoken')
const AuthorModel = require('../models/authorModel')
const BlogModel = require('../models/blogModel')
const Validator = require('../validation/validator')

// const ObjectId = require('mongoose').Types.ObjectId


//**     /////////////////////////      Authentication      //////////////////////       **//
const authenticateAuthor = async (req, res, next) => {
    try {
        // extracting the token from request's headers
        let token = req.headers['x-api-key']
        // checking if not token ..
        if (!token) return res.status(404).send({ status: false, msg: "token must be present" })

        // else verifying that token
        // verify takes two parameter
        // jwt.verify(<token from header>, "secret <used to create that token>")
        let decodedToken = JWT.verify(token, "-- plutonium-- project-blogging-site -- secret-token --")    // hv to chk callback to find evry part of token's error

        // checking if not decodedToken .i.e. given token is not a valid token
        if (!decodedToken) return res.status(400).send({ status: false, msg: "invalid token" })

        // setting decodedToken in the response headers and passing the value of this function's data stored in decodedToken
        req.decodedToken = decodedToken

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**     /////////////////////////      Authorisation      //////////////////////       **//
const authoriseAuthor = async (req, res, next) => {

    try {

        // extracting the userId from the decodedToken's sent data( req.decodedToken.AuthorId )
        let loggedInAuthorId = req.decodedToken.userId

        // taking the author from path params (who is requesting route)
        let requestingAuthorId = req.params.authorId
        if (!Validator.validateId(requestingAuthorId)) return res.status(404).send({ status: false, msg: 'invalid authorId provided in path params' })

        // checking with two id's that author who is requesting route and whose data in token are the same
        if (loggedInAuthorId != requestingAuthorId) return res.status(401).send({ status: false, msg: 'user is not authorised' })
        
        let blogIdFromParams = req.params.blogId;                  // taking blogId from params and checking that it's present

        let foundBlog = await BlogModel.findById(blogIdFromParams)          // finding the blog with blogId inside BlogModel

        // sending values
        
        req.loggedInAuthorId = loggedInAuthorId         // userId found from token
        req.requestingAuthorId = requestingAuthorId     // userId from params
        req.foundBlog = foundBlog                       // the blog found
        req.blogIdFromParams = blogIdFromParams         // blog id from params

        next()

    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

module.exports = { authenticateAuthor, authoriseAuthor }