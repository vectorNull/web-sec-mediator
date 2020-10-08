const { request } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { restart } = require('nodemon');

// @route   GET api/profile/me
// @desc    Get current users's profile
// @access  Private (needs auth)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'})
        }        
        res.json(profile);   
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route   POST api/profile/
// @desc    Create / update user profile
// @access  Private (needs auth)
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
    ]], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {             // destructuring req.body
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if  (company) profileFields.company = company;
        if  (location) profileFields.location = location;
        if  (website) profileFields.website = website;
        if  (bio) profileFields.bio = bio;
        if  (status) profileFields.status = status;
        if  (githubusername) profileFields.githubusername = githubusername;
        if  (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        
        // Build social object
        profileFields.social = {};
        if  (youtube) profileFields.social.youtube = youtube
        if  (twitter) profileFields.social.twitter = twitter
        if  (facebook) profileFields.social.facebook = facebook
        if  (linkedin) profileFields.social.linkedin = linkedin
        if  (instagram) profileFields.social.instagram = instagram

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields}, 
                    { new: true }
                );
                return res.json(profile)
            }
            // Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    }
);

// @route   GET api/profile/user/:user_id
// @desc    Get profile uby user_id
// @access  Public 
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public 
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) 
            return res.status(400).json({ msg: 'Profile not found' })
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' })
        }
        res.status(500).send('Server Error');
    }
})


module.exports = router;