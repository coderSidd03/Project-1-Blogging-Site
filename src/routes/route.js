// importing express // creating router
const express = require('express');
const router = express.Router();

// importing controllers
const MW = require('../middlewares/commonMiddleware')
const AuthorController = require("../controllers/authorController");
const BlogController = require("../controllers/blogController");
const Validator = require("../validation/validator")


//**    APIS   **//
// Author apis
router.post("/login", AuthorController.login);
router.post("/authors", AuthorController.createAuthor);

// blogs apis
router.post("/blogs", MW.authenticateAuthor, BlogController.createBlog);
router.get("/getBlogs", MW.authenticateAuthor, BlogController.getBlogs);
router.put('/blogs/:authorId/:blogId', MW.authenticateAuthor, MW.authoriseAuthor, BlogController.updateBlog);

// delete apis
router.delete('/blogs/:authorId/:blogId', MW.authenticateAuthor, MW.authoriseAuthor, BlogController.deleteBlogById);
router.delete('/blogs/:authorId', MW.authenticateAuthor, MW.authoriseAuthor, BlogController.deleteBlogByQueryParam);


// error handling => wrong path in path params
// if a given path is not matching any of our routes
// it will return this error  
//* way-2 ,  //** way-1 in route.js ln: 21
router.all("/*", (req, res) => {
    res.status(404).send({
        status: false, message: "/ Given Path Is Unidentified /"
    });
});


module.exports = router;