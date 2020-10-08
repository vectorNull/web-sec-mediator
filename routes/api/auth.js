const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const {check, validationResult} = require('express-validator/check');

const User = require('../../models/User')

// route   GET api/auth
// desc    TEST route
// access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

// route            POST api/auth
// description:     Authenticate user and get token
// access           Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //deconstruct req.body
        const { email, password } = req.body;
        
        try {
            // See if user exists 
            let user = await User.findOne({ email });
            if(!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });  
            }
            // Check for correct passwd 
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            // Return jsonwebtoken that can used to access protected routes / sent with requests
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
                if(err) throw err;
                res.json({ token });
            });
           
        } catch(err) {
            console.err(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;