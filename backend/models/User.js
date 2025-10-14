//define how a User looks in MongoDB
//Initialize mongoose
const mongoose = require('mongoose');

//define the User schema
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,}
    });

    //create the User model from the schema
    const User = mongoose.model('User', userSchema);

//export the User model
module.exports = User;
//module.exports = mongoose.model('User', userSchema); (alternative export method)

