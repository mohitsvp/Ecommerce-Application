const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const {generateToken} = require("../config/jwtToken");
const validateMongoDBId = require("../utils/validateMongodbId");


// Register a User
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    return res.status(201).send(newUser);
  } else {
   throw new Error('User already exists');
  }
});

// Login a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user already exists
    let user = await User.findOne({ email: email}); 
    if(user && await user.isPasswordMatched(password)) {
        const {_id, first_name, last_name, email, mobile, role} = user;
        return res.status(200).send({
            first_name,
            last_name,
            email,
            mobile,
            role,
            token: generateToken(_id)
        });
    }
    else{
        throw new Error('Invalid Credentials');
    }
})


// ------------------------------------------ CRUD OPERATIONS ------------------------------------------

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
       const users = await User.find();
       return res.status(200).send(users); 
    } catch (error) {
        throw new Error(error);
    }
})

// Get A User
const getAUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDBId(id)
        const user = await User.findById(id);
        if(!user){
            return res.status(404).send({message: "User not found"});
        }
        return res.status(200).send(user);
    } catch (error) {
        throw new Error(error);
    }
})

// Update user
const updateUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDBId(id)
        const user = await User.findByIdAndUpdate(id, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            mobile: req.body.mobile
        }, {new: true});
        if(!user){
            return res.status(404).send({message: "User not found"});
        }
        return res.status(200).send(user);
    } catch (error) {
        throw new Error(error);
    }
})

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDBId(id)
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).send({message: "User not found"});
        }
        return res.status(200).send(user);
    } catch (error) {
        throw new Error(error);
    }
});

// Block the user
const blockUser = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        validateMongoDBId(id)
        const block = await User.findByIdAndUpdate(id, {isBlocked: true}, {new: true});
        if(block) {
            return res.status(200).send({message: 'User blocked'});
        }
        else{
            throw new Error("User not found");
        }
    } catch (error) {
        throw new Error(error);
    }
})

// Un Block the user
const unBlockUser = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        validateMongoDBId(id)
        const block = await User.findByIdAndUpdate(id, {isBlocked: false}, {new: true});
        if(block) {
            return res.status(200).send({message: 'User Un-blocked'});
        }
        else{
            throw new Error("User not found");
        }
    } catch (error) {
        throw new Error(error);
    }
})


module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getAUser,
  updateUser,
  deleteUser,
  blockUser,
  unBlockUser
};
