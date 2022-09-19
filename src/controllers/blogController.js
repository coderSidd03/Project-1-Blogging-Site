const BlogModel = require("../models/blogModel");
const AuthorModel = require('../models/authorModel');
const Validator = require('../validation/validator')
const { default: mongoose } = require('mongoose');
const moment = require("moment");


//**     /////////////////////////      Createblog      //////////////////////       **//
const createBlog = async (req, res) => {
    try {
        // taking data from body
        let blogData = req.body
        // using destructuring of object (as we get data as json obj from postman) here we defining the key name we are getting from body and then we can call them with this defined name
        let { title, body, authorId, category, isPublished, tags, subcategory, ...rest } = blogData;

        //checking that there is data inside body
        if (!Validator.checkInputsPresent(blogData)) return res.status(400).send({ status: false, msg: "please provide details to create a blog" })

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (Validator.checkInputsPresent(rest)) return res.status(400).send({ status: false, msg: "please provide required details only => title, body, authorId, category, isPublished " });

        // checking all the required fields are present or not(sending error msg according to that)
        if (!Validator.checkString(title)) return res.status(400).send({ status: false, msg: "Title is required [ in string ] " });
        if (!Validator.checkString(body)) return res.status(400).send({ status: false, msg: "Body is required [ in string ] " });

        if (!Validator.checkString(authorId)) return res.status(400).send({ status: false, msg: "AuthorId is required [ in string ] " });
        // checking that the authorId which is given is that in a perfect _id format .i.e. is it a hex value or not 
        // every ObjectId has a specific format (we saw _id creates automatically and it's unique too )     // _id: creates with a hex value (0-9, a-f)
        if (!Validator.validateId(authorId)) return res.status(400).send({ status: false, msg: "AuthorId is invalid" });

        if (!Array.isArray(category)) return res.status(400).send({ status: false, msg: "Category is required [ in array of strings ] " });

        //finding by authorId   &  //checking for a valid authorId
        const validateAuthorId = await AuthorModel.findById(authorId);
        if (!validateAuthorId) return res.status(404).send({ status: false, msg: "Author is not present, create author first" });

        // creating new blog
        const data = await BlogModel.create(blogData);

        if (isPublished) {
            data.publishedAt = moment().format('DD MM YYYY hh:mm:ss a');
            data.save();
        }

        res.status(201).send({ status: true, data: data });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**     /////////////////////////      getBlogs      //////////////////////       **//
const getBlogs = async (req, res) => {
    try {

        // taking all queries from query param and destructuring
        let queries = req.query
        let { tags, category, subcategory, authorId, ...rest } = { ...queries };

        //checking if any other attributes (keys) in req query is present or not (which we don't required)
        if (Validator.checkInputsPresent(rest)) return res.status(400).send({ status: false, msg: "please provide query between valid credentials only => tags, category, subcategory, authorId" });

        // checking that if authorId present , provided authorId's format is a hex value (common format for all ids in mongo DB)
        if (authorId && (!Validator.validateId(authorId))) return res.status(400).send({ status: false, msg: "provided authorId is invalid" });

        // passing the queries variable inside find, desired filterisation too for validation
        let allBlogs = await BlogModel.find({
            $and: [queries, { isDeleted: false, isPublished: true }]
        });

        // handling this error if no data found (find returns array of objects) => 
        // way-1
        // if (!allBlogs[0]) return res.status(404).send({ status: false, msg: "No blog found" });
        // way-2
        if (allBlogs.length == 0) return res.status(404).send({ status: false, msg: "No blog found" });


        // sending response
        // if we put query then also getting choices
        res.status(200).send(
            {
                status: true,
                choice: 'customize result can be obtained with query param inputs',
                data: allBlogs
            }
        );
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**     /////////////////////////      updateBlog      //////////////////////  /blogs/:blogId      **//
const updateBlog = async (req, res) => {

    try {

        // taking the userId who is requesting this route
        let requestingAuthorId = req.requestingAuthorId
        // taking the blog from authorise middleware

        // taking blogId (provided in params) from middleware/authorisation 
        let blogIdFromParams = req.blogIdFromParams;
        // checking the blogId(path params) format is in hex value
        if (!Validator.validateId(blogIdFromParams)) return res.status(400).send({ status: false, msg: 'invalid blogId provided in path params' })

        // taking the blog found from the authorisation
        let searchedBlog = req.foundBlog

        // getting blog from middleware(authorisation) in searchedBlog variable
        if (!searchedBlog) return res.status(404).send({ status: false, msg: "invalid blogId" });

        // extracting authorId from blog
        let authorIdFromBlog = searchedBlog['authorId'].toString();

        // checking that both author are same
        if (requestingAuthorId != authorIdFromBlog) return res.status(404).send({ status: false, msg: "author has no permission to change other's blog" });

        // taking details from the body
        let detailsFromBody = req.body;
        // destructuring 
        let { title, body, category, isPublished, tags, subcategory, ...rest } = detailsFromBody;

        //checking if any other attributes (keys) in req body is present or not (which we don't required to save)
        if (Validator.checkInputsPresent(rest)) return res.status(400).send({ status: false, msg: "please request with acceptable fields only => title, body, category, isPublished, tags, subcategory to update your document" })

        let checkBlogToUpdate = await BlogModel.findById(blogIdFromParams)
        if (checkBlogToUpdate['isDeleted'] == true) return res.status(400).send({ status: false, msg: "requested document has already deleted" });

        // updating that blog with findOneAndUpdate
        const updatedBlog = await BlogModel.findOneAndUpdate(
            { _id: blogIdFromParams },
            {
                $push: { tags: tags, subcategory: subcategory, category: category },
                $set: { title: title, body: body, isPublished: true, publishedAt: moment().format('DD/MM/YYYY  hh:mm:ss a') }
            },
            { new: true }
        );
        res.status(200).send({ status: true, data: updatedBlog });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**     /////////////////////////      deleteBlog by ID     //////////////////////  /blogs/:blogId      **//
const deleteBlogById = async (req, res) => {
    try {
        let requestingAuthorId = req.requestingAuthorId         // authorId who is requesting route (from params)
        let blogIdFromParams = req.blogIdFromParams;            // blogId from params


        //let isBlogIdPresentDb = await BlogModel.findById(blogId);       // checking blog is present or not
        let checkBlog = await BlogModel.findById(blogIdFromParams);
        if (!checkBlog) return res.status(404).send({ status: false, msg: "Blog is not exist" }); 

        let authorIdFromReqBlog = checkBlog['authorId']                   // authorId found from blog        

        // checking that the author who requesting route is trying to delete his own blog 
        if (requestingAuthorId != authorIdFromReqBlog) return res.status(400).send({ status: false, msg: "author has no permission to delete other's blog" });

        // checking that the found document's isDeleted key is true or not
        if (checkBlog.isDeleted === true) return res.status(400).send({ status: false, msg: "you are requesting to delete already deleted blog" });

        // deleting that perticular doc
        let deleteBlog = await BlogModel.updateOne(
            { _id: blogIdFromParams },
            { isDeleted: true, deletedAt: moment().format('DD/MM/YYYY  hh:mm:ss a') },
            { new: true }
        );
        res.status(200).send({ status: true, msg: "document deleted successfully" });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//**     /////////////////////////      deleteBlog  by query    //////////////////////  /blogs?queryParams      **//
const deleteBlogByQueryParam = async (req, res) => {
    try {
        // taking the userId who is requesting this route
        let requestingAuthorId = req.requestingAuthorId

        // taking queries
        let queries = req.query;
        if (!Validator.checkInputsPresent(queries)) return res.status(400).send({ status: false, msg: "please add queries" });

        let { tags, category, subcategory, authorId, isPublished, ...rest } = req.query;

        if (Validator.checkInputsPresent(rest)) return res.status(400).send({ status: false, msg: " please provide valide filter key in query => tags, category, subcategory, authorId, isPublished only" })

        if (authorId && !Validator.validateId(authorId)) return res.status(400).send({ status: false, msg: "provided authorId in invalid" });

        // if authorId not present or != requesting author's id , then setting the req authorId by default
        if (!authorId || (authorId != requestingAuthorId)) req.query.authorId = requestingAuthorId;

        // validating queries inside BlogModel      // filterByQuery returns an array of objects
        let filterByQuery = await BlogModel.find(queries, { isDeleted: false });
        if (filterByQuery.length == 0) return res.status(404).send({ status: false, msg: "No blog found to delete" });

        // deleting documents according to the query param inputs
        // according to those data there will may be a scenario where we have to update many docs
        // thats'why we are using updateMany
        let deletedBlogDetails = await BlogModel.updateMany(
            // using $and to target those docs matching with queries taken and those are not deleted
            { $and: [queries, { isDeleted: false }] },
            { $set: { isDeleted: true, deletedAt: moment().format('DD/MM/YYYY hh:mm:ss a') } },
            { new: true }
        );
        res.status(200).send({ status: true, msg: "matched document deleted successfully" });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}



module.exports = { createBlog, getBlogs, updateBlog, deleteBlogById, deleteBlogByQueryParam };