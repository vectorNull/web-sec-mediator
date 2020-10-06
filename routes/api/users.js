// https://express-validator.github.io/docs/

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator/check');

const User = require('../../models/users');

// route            POST api/users
// description:     register user
// access           Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //deconstruct req.body
        const { name, email, password} = req.body;
        
        try {
            // See if user exists
            let user = await User.findOne({ email });
            if(user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }
             // Get user avatar
            const avatar = gravatar.url(email, {
                s: '200',   //image size
                r: 'pg',    //rating - no nudes :)
                d: 'mm'     //provides a default image
            })

            user = new User({
                name,
                email,
                avatar,
                password
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);                  //generates a salt with 10 rounds
            user.password = await bcrypt.hash(password, salt)       //password + salt ==> hashed passwd

            await user.save();

            // Return jsonwebtoken
            res.send('User Registered');
        } catch(err) {
            console.err(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;