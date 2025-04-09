const util = require('../models/util.js')
const config = require("../server/config/config")
const Post = require("../models/post")
const express = require('express')
const memberController = express.Router()

// Initialize MongoDB client
let client = null;
const getClient = async () => {
    if (!client) {
        client = util.getMongoClient()
        await client.connect()
    }
    return client
}
 
// Authentication Middleware
const authenticate = (req, res, next) => {
    
    console.log('Session check:', req.session ? 'Session exists' : 'No session');
    console.log('User in session:', req.session?.user ? 'Yes' : 'No');
    
    if (!req.session || !req.session.user) {
        console.log('Authentication failed: No session or user');
        
        
        return res.redirect('/index.html');
        
      
    }
    
    req.user = req.session.user;
    console.log('User authenticated:', req.user.username);
    next();
}


memberController.get('/member.html', authenticate, (req, res) => {
    console.info('Accessing member.html directly');
    res.sendFile('member.html', { root: config.ROOT });
});



//  Authorization Middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            console.log('Authorization failed: No session or user');
            return res.status(401).json({ 
                success: false, 
                message: 'You need to be logged in' 
            });
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            console.log('Authorization failed: Insufficient role', req.session.user.role);
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }

        console.log('User authorized with role:', req.session.user.role);
        next();
    }
}

// Member page route
memberController.get('/member', authenticate, async (req, res) => {
    try {
        console.info('Inside member.html route');
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Posts');
 
        
        res.sendFile('member.html', { root: config.ROOT });
    } catch (error) {
        console.error('Error in member route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Member page HTML route 
memberController.get('/member.html', authenticate, async (req, res) => {
    try {
        console.info('Accessing member.html directly');
        res.sendFile('member.html', { root: config.ROOT });
    } catch (error) {
        console.error('Error serving member.html:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Fetch posts route
memberController.get('/posts', authenticate, async (req, res) => {
    try {
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Posts');
        const posts = await util.findAll(collection, {});
        
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching posts' 
        });
    }
});

// Fetch individual post route
memberController.get('/post/:ID', authenticate, async (req, res) => {
    try {
        const id = req.params.ID;
        console.info(`Post Id ${id}`);
        
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Posts');
        const post = await util.findOne(collection, id);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: 'Post not found' 
            });
        }
        
        console.log('Post', post);
        res.status(200).json({ post: post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching post' 
        });
    }
});

// Post message route 
memberController.get('/postMessage', 
    authenticate,
    authorizeRole(['member', 'admin']), 
    (req, res) => {
        res.sendFile('postMessage.html', { root: config.ROOT });
    }
);

// Add post route
memberController.post('/addPost', 
    authenticate, 
    authorizeRole(['member', 'admin']), 
    async (req, res) => {
        try {
            const { topic, message } = req.body;
            const user = req.session.user.username;

           
            if (!topic || !message) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Topic and message are required' 
                });
            }

            const dbClient = await getClient();
            const collection = dbClient.db().collection('Posts');
            const post = Post(topic, message, user);
            
            await util.insertOne(collection, post);
            
            res.status(201).json({ 
                success: true, 
                message: `Post added to ${topic} forum` 
            });
        } catch (error) {
            console.error('Error adding post:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error adding post' 
            });
        }
    }
);

module.exports = memberController;