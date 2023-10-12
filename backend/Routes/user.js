const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Note = require('../Models/Note');

router.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Hey, Welcome to NoteNest!"
    })
})

router.post('/signup', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (validator.isEmpty(username) || validator.matches(username, /[./\[\]{}<>]/)) {
        return res.status(400).json({
            status: 'FAILURE',
            error: 'Invalid username'
        });
    }

    if (validator.isEmpty(password) || validator.matches(password, /[./\[\]{}<>]/)) {
        return res.status(400).json({
            status: 'FAILURE',
            error: 'Invalid username'
        });
    }
    try {
        const userExist = await User.findOne({ username })
        if (userExist) {
            return res.status(400).json({
                statusCode: 400,
                status: 'FAILURE',
                message: 'Username already exists'
            });
        }
        bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                username,
                password: hashedPassword
            });
            user.save();
        }).then(() => {
            return res.status(201).json({
                statusCode: 201,
                status: 'SUCCESS',
                message: "Please login to continue"
            })
        })
    } catch (err) {
        if (err) {
            return res.status(400).json({
                statusCode: 201,
                message: err
            })
        }
        next(err);
    }
})

module.exports = router;