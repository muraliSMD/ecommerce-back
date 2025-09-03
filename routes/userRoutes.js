const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");


//User Registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "user already exists"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({name, email, password:hashedPassword});
        await newUser.save();
       const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
       res.status(201).json({user: newUser, token});
    } catch (error) {
        res.status(500).json({message: "server Error", error});
    }
});


//User Login
router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email});
        if(!user) return res.status(400).json({ message : "invalid credentials"});
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) return res.status(400).json({ message: "invalid Credentials"});
        const token = await jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
        res.json({user, token});
    } catch (error) {
        res.status(500).json({message: "server error", error});
    }
});

//get current user profile

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user) return res.status(400).json({message: "user not found"});
        res.json(user);
    } catch (error) {
        res.status(500).json({message: "server error", error});
    }
});

//get all users (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({message: "server error", error});
    }
});

//update user profile
router.put("/:id", authMiddleware, async (req, res) => {
    try{
        if(req.user.role !== "admin" && req.userId !== req.params.id) {
            return res.status(403).json({messsage : "forbidden"});
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new : true}
        ).select("-password");
        if(!updatedUser) return res.status(404).json({message: "user not found"});
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({message : "server error", error});
    }
});


//delete user

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        //  if(req.user.role !== "admin" && req.userId !== req.params.id) {
        //     return res.status(403).json({message : "forbidden"});
        //  }
          const deleteUser = await User.findByIdAndDelete(req.params.id);
            if(!deleteUser) return res.status(404).json({message: "user not found"});
            res.json({message: "user deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "server error", error});

    }
});


module.exports = router;



     

