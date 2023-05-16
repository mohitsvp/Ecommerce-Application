const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const {generateToken} = require("../config/jwtToken");
const validateMongoDBId = require("../utils/validateMongodbId");
const generateRefreshToken = require("../config/refreshToken");
const jwt  = require("jsonwebtoken");


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
        const {id, first_name, last_name, email, mobile, role} = user;
        // Refresh Token
        const refreshToken = await generateRefreshToken(id);
        const updateUser = await User.findByIdAndUpdate(id, {refreshToken}, {new: true})
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24*60*60*7000
        })
        return res.status(200).send({
            first_name,
            last_name,
            email,
            mobile,
            role,
            token: generateToken(id),
        });
    }
    else{
        throw new Error('Invalid Credentials');
    }
})

// Handle Refresh Token

const handleRefreshToken = asyncHandler(async (req, res) => {
    try {
        const cookie = req.cookies;
        if(!cookie.refreshToken) throw new Error('No Refresh Token in Cookie')
        const {refreshToken} = cookie;
        const user = await User.findOne({refreshToken});
        if(!user) throw new Error ('No refresh token present in db');
        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
           if(err || user.id !== decoded.id) {
            throw new Error ('There is something wrong with refresh token')
           }
           else{
            const accessToken = generateToken(user.id);
            return res.send({accessToken})
           }
        });
    } catch (error) {
        return res.status(500).send(error)
    }
}) 

//  Logout functionality

const logout = asyncHandler(async (req, res) => {
    try {
        const cookie = req.cookies;
        if(!cookie.refreshToken) throw new Error('No Refresh Token in Cookie')
        const {refreshToken} = cookie;
        const user = await User.findOne({refreshToken});
        if(!user) {
            res.clearCookie("refreshToken", {httpOnly: true, secure: true})
            res.sendStatus(204);
        }
        await User.findOneAndUpdate({refreshToken}, {refreshToken: ''});
        res.clearCookie("refreshToken", {httpOnly: true, secure: true});
        res.sendStatus(204);
    } catch (error) {
        throw new Error(error);
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


module.exports = { createUser, loginUser, getAllUsers, getAUser, updateUser, deleteUser, blockUser, unBlockUser, handleRefreshToken, logout };
