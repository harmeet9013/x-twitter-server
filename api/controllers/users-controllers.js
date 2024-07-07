import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

import createError from "http-errors";
import User from "../models/user.js";

export const tokenVerify = async (req, res, next) => {
    let token, userID, loggedUser;

    try {
        const authHeader = req.headers["authorization"];
        token = authHeader && authHeader.split(" ")[1];
        userID = req.headers["userid"];
    } catch (error) {
        return next(createError(400, "Bad Request"));
    }

    JWT.verify(token, process.env.tokenKEY, async (error, user) => {
        if (error) {
            return next(createError(403, "Invalid Token"));
        } else {
            try {
                loggedUser = await User.findById(userID);
            } catch (error) {
                return next(createError(500, "Database Offline"));
            }

            return res.status(200).json({
                username: loggedUser.username,
                name: loggedUser.name,
                avatar: loggedUser.avatar,
            });
        }
    });
};

export const loginUser = async (req, res, next) => {
    let emailUsername,
        password,
        currentUser,
        token,
        userValidation = false,
        isEmail = false;

    // Regular expression to match an email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // check if the loginData exists
    try {
        emailUsername = req.body.emailUsername;
        password = req.body.password;
    } catch (error) {
        return next(createError(400, "Bad Request"));
    }

    // Check if the input matches the email pattern
    if (emailPattern.test(emailUsername)) {
        isEmail = true;
    }

    // find the username or email
    if (isEmail) {
        currentUser = await User.findOne({ email: emailUsername });
    } else {
        currentUser = await User.findOne({ username: emailUsername });
    }

    // if the user does not exist === null
    if (!currentUser) {
        return next(createError(500, "This email or username does not exist!"));
    }

    // compare the password
    try {
        userValidation = await bcrypt.compare(password, currentUser.password);
    } catch (error) {
        return next(createError(500, "Server Error"));
    }

    if (!userValidation) {
        return next(createError(403, "Invalid password!"));
    }

    // generate token
    try {
        token = JWT.sign(
            { userID: currentUser._id, name: currentUser.name },
            process.env.tokenKEY,
            { expiresIn: "1h" }
        );
    } catch (error) {
        return next(createError(500, "Could not generate token"));
    }

    // send back the response
    return res.status(200).json({
        userID: currentUser._id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        token,
    });
};

export const checkUsername = async (req, res, next) => {
    let username, result;

    try {
        username = req.body.username;
    } catch (error) {
        return next(createError(500, "Bad Request"));
    }

    result = await User.exists({ username });

    if (!result) {
        return res.status(200).json({ message: username + " is available!" });
    } else {
        return res.status(409).json({ message: username + " already exists!" });
    }
};

export const createUser = async (req, res, next) => {
    let name,
        email,
        username,
        password,
        hashPassword,
        validateUsername,
        validateEmail,
        token,
        savedUser;

    // verify inputs exist
    try {
        name = req.body.userData.name;
        email = req.body.userData.email;
        username = req.body.userData.username;
        password = req.body.userData.password;
    } catch (error) {
        return next(createError(400, "Bad Request"));
    }

    validateUsername = await User.exists({ username });
    validateEmail = await User.exists({ email });

    // throw error if username or email exists
    if (validateUsername || validateEmail) {
        return next(createError(500, "Username or Email already exists!"));
    }

    // encrypt the password
    try {
        hashPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(createError(500, "Could not create user"));
    }

    // create new user
    let newUser = new User({
        name,
        username,
        email,
        password: hashPassword,
        avatar: "https://i.ibb.co/QXVvvcS/photo-2023-05-22-21-00-29.jpg",
        tweets: [],
    });

    // save newUser to database
    try {
        await newUser.save();
    } catch (error) {
        console.log(error);
        return next(createError(500, "Database offline. Try again later."));
    }

    // find created user
    try {
        savedUser = await User.findOne({
            username,
            email,
            password: hashPassword,
        });
    } catch (error) {
        return next(createError(500, "Database offline. Try again later."));
    }

    // generate token
    try {
        token = JWT.sign(
            { userID: savedUser._id, name: savedUser.name },
            process.env.tokenKEY,
            { expiresIn: "1h" }
        );
    } catch (error) {
        return next(createError(500, "Could not generate token"));
    }

    // send back the response
    return res.status(201).json({
        userID: savedUser._id,
        username: savedUser.username,
        name: savedUser.name,
        avatar: savedUser.avatar,
        token,
    });
};
