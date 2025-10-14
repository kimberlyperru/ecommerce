//import modules for our ecommerce backend
const express = require('express'); //the server framework
const mongoose = require('mongoose'); //to interact with MongoDB
const bodyParser = require('body-parser'); //to parse incoming request bodies
const cors = require('cors'); //to handle Cross-Origin Request Sharing

//initialize the express app
const app = express();

//middleware setup
app.use(bodyParser.json()); //parse JSON request bodies
app.use(cors()); //enable CORS(cross-origin resource sharing) for all routes