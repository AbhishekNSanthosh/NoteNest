const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Note = require('../Models/Note');
const { verifyToken } = require('../libs/Auth');

//Test api
router.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Hey, Welcome to NoteNest! Developed by Abhishek Santhosh."
    })
})

//api to register a user 
router.post('/register', async (req, res, next) => {
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
            statusCode: 400,
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
        }).catch((err) => {
            return res.status(400).json({
                statusCode: 400,
                message: err.message
            })
        })
    } catch (err) {
        if (err) {
            return res.status(400).json({
                statusCode: 400,
                message: err.message
            })
        }
        next(err);
    }
})


//api to login a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (validator.isEmpty(username) || validator.matches(username, /[./\[\]{}<>]/)) {
            return res.status(400).json({
                status: 'FAILURE',
                message: 'Invalid username'
            });
        }

        if (validator.isEmpty(password) || validator.matches(password, /[./\[\]{}<>]/)) {
            return res.status(400).json({
                statusCode: 400,
                status: 'FAILURE',
                message: 'Invalid username'
            });
        }
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                statusCode: 401,
                status: 'FAILURE',
                message: 'Authentication failed. User not found.'
            });
        }

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({
                username: user.username, userId: user._id
            }, "NOTENEST", { expiresIn: '1h' });

            return res.status(200).json({
                statusCode: 200,
                status: 'SUCCESS',
                greetings: `Welcome ${user.username.toUpperCase()} to NoteNest!!!`,
                accessToken: token,
                message: 'Authentication successful',
            });
        } else {
            return res.status(401).json({
                statusCode: 401,
                status: "FAILURE",
                message: 'Authentication failed. Wrong password.'
            });
        }
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            message: err.message
        });
    }
});

//api to create a new note
router.post('/notes', verifyToken, async (req, res) => {
    try {
        const { title, desc } = req.body;
        const note = new Note({ title, desc, createdBy: req.userId });
        const savedNote = await note.save();
        return res.status(201).json({
            status: 201,
            status: "SUCCESS",
            message: "Note added successfully!",
            data: savedNote,
            accessToken: req.accessToken
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err.message
        });
    }
});

//api to get all notes
router.get('/notes', verifyToken, async (req, res) => {
    try {
        const notes = await Note.find({});
        return res.status(200).json({
            status: 200,
            status: "SUCCESS",
            message: "Here is your notes!",
            data: notes,
            accessToken: req.accessToken
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err.message
        });
    }
});

//api to search note based on title
router.get('/getNotesByTitle', async (req, res) => {
    const { title } = req.query;

    try {
        const notes = await Note.find({ title: new RegExp(title, 'i') }); // Case-insensitive title search
        return res.status(200).json({
            status: 200,
            status: "SUCCESS",
            data: notes,
            accessToken: req.accessToken
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err.message
        });
    }
});

//api to get single note details by id.
router.get('/getNoteDetailsById/:noteId', verifyToken, async (req, res) => {
    const { noteId } = req.params;
    try {
        const note = await Note.findOne({ createdBy: req.userId, _id: noteId });

        if (!note) {
            return res.status(404).json({
                statusCode: 404,
                status: "FAILURE",
                message: "No notes to display!"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            data: note,
            accessToken: req.accessToken
        })
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err.message
        })
    }
})

//api to edit the note created by noteId
router.put('/updateNoteById/:noteId', verifyToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, desc } = req.body;
    const userId = req.userId;

    try {
        const note = await Note.findOne({ _id: noteId, createdBy: userId });

        if (!note) {
            return res.status(401).json({
                statusCode: 401,
                status: "FAILURE",
                message: 'This note does not belong to the you!'
            });
        }
        // Update the note if it belongs to the user
        note.title = title;
        note.desc = desc;

        const updatedNote = await note.save();
        res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            message: "Hey, here is your note details!",
            data: updatedNote,
            accessToken:req.accessToken
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err
        });
    }
});

module.exports = router;