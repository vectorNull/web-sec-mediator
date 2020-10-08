const express = require('express');
const request = require('request');
const config = require('config');
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

// @route   DELETE api/profile
// @desc    Delete profile, user, and posts
// @access  Private 
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private 
router.put('/experience', [auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors:errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.err(err.message);
            res.status(500).send('Server Error');
        }
});

// @route   DElETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private 
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        foundProfile.experience = foundProfile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);
        
        await foundProfile.save();
        return res.status(200).json(foundProfile);
      } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Server error" });
        } 
    }
);

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private 
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
    ]
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors:errors.array() });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.err(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DElETE api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private 
router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        const eduIds = foundProfile.education.map(edu => edu._id.toString());
        const removeIndex = eduIds.indexOf(req.params.edu_id);
        if (removeIndex === -1) {
            return res.status(500).json({ msg: "Server error" });
        } else {
            foundProfile.education.splice(
                removeIndex,
                1,
            );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
        }
    }
);

// @route   GET api/profile/github/:username
// @desc    Get user repo from Github
// @access  Public 
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };
        request(options, (error, response, body) => {
            if(error) console.error(error);
            if(response.statusCode !== 200) {
                return res.status(404).json({ msg: 'Not Github profile found' });
            }
            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
})
module.exports = router;