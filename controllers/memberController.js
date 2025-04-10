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

// Authorization Middleware
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

// Resource ownership middleware - only post owner or admin can modify
const authorizeOwnership = async (req, res, next) => {
    try {
        const postId = req.params.id;
        
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }
        
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Posts');
        const post = await util.findOne(collection, postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Check if user is admin (admins can edit any post)
        if (req.session.user.role === 'admin') {
            req.post = post; // Attach post to request for later use
            return next();
        }
        
        // Check if user is the post owner
        if (post.By === req.session.user.username) {
            req.post = post; // Attach post to request for later use
            return next();
        }
        
        // User is not authorized to modify this post
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to modify this post'
        });
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization check'
        });
    }
};

// HTML Routes
memberController.get('/member.html', authenticate, (req, res) => {
    console.info('Accessing member.html directly');
    res.sendFile('member.html', { root: config.ROOT });
});

memberController.get('/member', authenticate, async (req, res) => {
    try {
        console.info('Inside member.html route');
        res.sendFile('member.html', { root: config.ROOT });
    } catch (error) {
        console.error('Error in member route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

memberController.get('/posts.html', authenticate, (req, res) => {
    console.info('Accessing posts.html directly');
    res.sendFile('posts.html', { root: config.ROOT });
});

memberController.get('/postMessage', 
    authenticate,
    authorizeRole(['member', 'admin']), 
    (req, res) => {
        res.sendFile('postMessage.html', { root: config.ROOT });
    }
);

// API Routes - CREATE
memberController.post('/addPost', 
    authenticate, 
    authorizeRole(['member', 'admin']), 
    async (req, res) => {
        try {
            console.log("Raw request body:", req.body);
            
            let topic = req.body.topic;
            let message = req.body.message;
            let user = req.body.postedBy || req.session.user.username; 
            
            console.log("Post submission received:", { topic, message, user });
           
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
            
            console.log("Post added successfully, redirecting to posts.html");
            return res.redirect('/posts.html');
        } catch (error) {
            console.error('Error adding post:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error adding post' 
            });
        }
    }
);

// API Routes - READ
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

memberController.get('/post/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
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

// API Routes - UPDATE
memberController.post('/updatePost/:id',
    authenticate,
    authorizeRole(['member', 'admin']),
    authorizeOwnership,
    async (req, res) => {
        try {
            const id = req.params.id;
            const { topic, message } = req.body;
            
            if (!topic || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Topic and message are required'
                });
            }
            
            const dbClient = await getClient();
            const collection = dbClient.db().collection('Posts');
            
            // Keep original By and At fields but update Topic and Message
            const originalPost = req.post;
            
            await collection.updateOne(
                { _id: originalPost._id },
                { $set: {
                    Topic: topic,
                    Message: message,
                    EditedAt: new Date().toUTCString(),
                    EditedBy: req.session.user.username
                }}
            );
            
            console.log(`Post ${id} updated successfully`);
            
            // Return success
            return res.status(200).json({
                success: true,
                message: 'Post updated successfully'
            });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating post'
            });
        }
    }
);


memberController.post('/deletePostAlt/:id', async (req, res) => {
    try {
        console.log(`Alternative delete request received for post ID: ${req.params.id}`);
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'You need to be logged in' 
            });
        }
        
        const id = req.params.id;
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Posts');
        
        // Find the post first
        const post = await util.findOne(collection, id);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: 'Post not found' 
            });
        }
        
        // Check authorization
        const isAdmin = req.session.user.role === 'admin';
        const isOwner = post.By === req.session.user.username;
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this post'
            });
        }
        
        // Delete the post
        await util.deleteOne(collection, { _id: post._id });
        
        return res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting post: ' + error.message
        });
    }
});

module.exports = memberController;