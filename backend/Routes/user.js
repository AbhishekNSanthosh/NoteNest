const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Note = require('../Models/Note');
const { verifyToken } = require('../libs/Auth');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 attempts
    message: 'Too many login attempts. Your account is locked for 10 minutes.',
});

//Test api
router.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Hey, Welcome to NoteNest! Developed by Abhishek Santhosh."
    })
})

//api to get user details
router.get('/info', verifyToken, async (req, res) => {
    const user = await User.findOne({ _id: req.userId });
    const { password, loginAttempts, lockUntil, ...userInfo } = user._doc
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        statusCode: 200,
        status: 'SUCCESS',
        message: "Hey, here's your data.",
        data: userInfo,
        accessToken: req.accessToken
    })
});

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
router.post('/login', limiter, async (req, res) => {
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
        if (user.lockUntil > new Date()) {
            return res.status(401).json({ message: 'Account is locked. Try again later.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            user.loginAttempts += 1;

            if (user.loginAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
            }

            await user.save();

            return res.status(401).json({ message: 'Invalid username or password' });
        }

        user.loginAttempts = 0;
        user.lockUntil = new Date(0);
        await user.save();

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
    const { title, desc, tags } = req.body;
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
        note.tags = tags;

        const updatedNote = await note.save();
        return res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            message: "Hey, here is your note details!",
            data: updatedNote,
            accessToken: req.accessToken
        });
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: err
        });
    }
});

//api to get archive a note
router.put('/archive/:id', verifyToken, async (req, res) => {
    const noteId = req.params.id;
    try {
        const note = await Note.findOne({ _id: noteId });
        if (note.archived === true) {
            return res.status(400).json({
                statusCode: 400,
                status: "FAILURE",
                message: "Note is already archived.",
                accessToken: req.accessToken
            });
        }
        note.archived = true
        const updatedNote = await note.save();
        return res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            message: "Note has archived.",
            data: updatedNote,
            accessToken: req.accessToken
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: error.message
        });
    }
})

//api to unarchive note
router.put('/unarchive/:id', verifyToken, async (req, res) => {
    const noteId = req.params.id;
    try {
        const note = await Note.findOne({ _id: noteId });
        if (note.archived === false) {
            return res.status(400).json({
                statusCode: 400,
                status: "FAILURE",
                message: "Note is already unarchived.",
                accessToken: req.accessToken
            });
        }
        note.archived = false
        const updatedNote = await note.save();
        return res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            message: "Note has unarchived.",
            data: updatedNote,
            accessToken: req.accessToken
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: error.message
        });
    }
})

//api to get notes based on tags
router.get('/getTaggedNotes', verifyToken, async (req, res) => {
    const { tags } = req.query;
    try {
        if (!tags) {
            return res.status(400).json({
                statusCode: 400,
                status: "FAILURE",
                message: 'Tags parameter is required'
            });
        }
        const notes = await Note.find({ tags: { $in: tags } });

        if (notes.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: "FAILURE",
                message: "No notes found with the given tags"
            });
        }
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            data: notes,
            message: error.message
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: error.message
        });
    }
})

//api to delete a note
router.delete('/removeNoteById', verifyToken, async (req, res) => {
    const { noteId } = req.body;
    try {
        const note = await Note.findOneAndRemove({ _id: noteId })
        if (!note) {
            return res.status(404).json({
                statusCode: 404,
                status: "FAILURE",
                message: "No notes found."
            });
        }

        if (note.createdBy === req.userId) {
            return res.status(401).json({
                statusCode: 401,
                status: "FAILURE",
                message: "Access denied!."
            });
        }

        await Note.findByIdAndRemove(noteId)
        return res.status(200).json({
            statusCode: 200,
            status: "SUCCESS",
            message: "Note has been deleted successfully.",
            accessToken: req.accessToken
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: "FAILURE",
            message: error.message
        });
    }
})

module.exports = router;