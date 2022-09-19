const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();


app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb+srv://Project-1:6H3EsS0qOKLtWR0B@cluster0.hln3nud.mongodb.net/Project-1?retryWrites=true&w=majority",
    {
        useNewUrlParser: true
    })
    .then(() => console.log("Database connected..."))
    .catch(err => console.log(err));


app.use('/', route);

// error handling => wrong path in path params 
// if a given path is not matching any of our routes
// it will return this error  
//* way-1 ,  //** way-2 in route.js ln: 28
// app.use((req, res, next) => {
//     const error = new Error('/ Given Path Is Unidentified /');
//     return res.status(404).send({status: 'ERROR', error: error.message})
// });


app.listen(PORT, () => {
    console.log(`Express app listening on port: ${PORT}...`);
});
