const util = require('../models/util.js')
const config = require("../server/config/config")
const User = require("../models/user")
const express = require('express')
const crypto = require('crypto')
const homeController = express.Router()

let client = null;
const getClient = async () => {
    if (!client) {
        client = util.getMongoClient()
        await client.connect()
    }
    return client
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hashPassword(password) {
    return password;
}

function verifyPassword(storedPassword, suppliedPassword) {
    console.log("Performing plain text password verification");
    const isValid = storedPassword === suppliedPassword;
    console.log(`Password verification result: ${isValid ? "Success" : "Failed"}`);
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

homeController.post('/register', util.logRequest, async (req, res) => {
    try {
        const { email, password, confirm } = req.body

        if (!email || !password || !confirm) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            })
        }
        if (password !== confirm) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            })
        }

        const dbClient = await getClient()
        const collection = dbClient.db().collection('Users')
        const existingUser = await collection.findOne({ 
            username: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') }
        })
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            })
        }

        const plainPassword = password
        const user = User(email, plainPassword)
        await util.insertOne(collection, user)

        req.session.user = {
            username: user.username,
            role: user.role
        }

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err)
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error creating user session' 
                })
            }
            res.status(201).json({ 
                success: true, 
                message: 'User registered successfully',
                user: {
                    username: user.username,
                    role: user.role
                }
            })
        })
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        })
    }
})

homeController.post('/login', util.logRequest, async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            })
        }

        const dbClient = await getClient()
        const collection = dbClient.db().collection('Users')
        console.log(`Login attempt for user: ${email}`)
        const user = await collection.findOne({ 
            username: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') }
        })
        console.log("User found in database:", user ? "Yes" : "No")
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            })
        }

        console.log(`Verifying password for user: ${user.username}`)
        console.log(`Stored password: ${user.password}`)
        console.log(`Supplied password: ${password}`)
        const isPasswordValid = verifyPassword(user.password, password)
        console.log(`Password verification result: ${isPasswordValid ? "Success" : "Failed"}`)
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            })
        }

        req.session.user = {
            username: user.username,
            role: user.role
        }
        console.log(`Created session for ${user.username} with role ${user.role}`)
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err)
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error creating user session' 
                })
            }
            res.status(200).json({ 
                success: true, 
                message: 'Login successful',
                user: {
                    username: user.username,
                    role: user.role
                }
            })
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        })
    }
})

homeController.get('/create-simple-user', async (req, res) => {
    try {
        const dbClient = await getClient();
        const collection = dbClient.db().collection('Users');
        const email = req.query.email || 'admin@example.com';
        const password = req.query.password || 'admin123';
        const role = req.query.role || 'admin';
        const existingUser = await collection.findOne({ 
            username: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') }
        });
        if (existingUser) {
            await collection.updateOne(
                { _id: existingUser._id },
                { $set: { 
                    password: password,  
                    role: role
                }}
            );
            return res.json({
                success: true,
                message: 'Updated existing user account',
                loginWith: { email, password }
            });
        }
        const user = User(email, password, role); 
        await util.insertOne(collection, user);
        res.json({
            success: true,
            message: 'User created with plain text password',
            loginWith: { email, password }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

homeController.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err)
        }
        res.redirect('/index.html')
    })
})

homeController.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            isLoggedIn: true,
            user: {
                username: req.session.user.username,
                role: req.session.user.role
            }
        })
    } else {
        res.json({
            isLoggedIn: false,
            user: null
        })
    }
})

homeController.get('/debug-user', async (req, res) => {
    try {
        const email = req.query.email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            })
        }
        const dbClient = await getClient()
        const collection = dbClient.db().collection('Users')
        const user = await collection.findOne({ 
            username: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') }
        })
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found',
                searchedFor: email
            })
        }
        const userInfo = {
            ...user,
            password: user.password 
        }
        return res.json({
            success: true,
            user: userInfo
        })
    } catch (error) {
        console.error('Debug route error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }
})

homeController.get('/list-users', async (req, res) => {
    try {
        const dbClient = await getClient()
        const collection = dbClient.db().collection('Users')
        const users = await collection.find({}).toArray()
        return res.json({
            success: true,
            count: users.length,
            users
        })
    } catch (error) {
        console.error('List users error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }
})

module.exports = homeController
