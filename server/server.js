
const fs = require("fs")
const path = require("path")
const express = require("express")
const session = require("express-session")
const server = express()
const config = require("./config/config")
const util = require('../models/util.js')
const homeController = require('../controllers/homeController')
const memberController = require('../controllers/memberController')


const initMongoDB = async () => {
  try {
    await util.connectToMongoDB() 
    console.log('\t|MongoDB connected successfully on startup!')
    return true
  } catch (error) {
    console.error('\t|MongoDB connection error:', error)
    process.exit(1) 
  }
}

//----------------------------------------------------------------
// middleware
//----------------------------------------------------------------

server.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  }
}))

server.use(express.static(config.ROOT))
server.use(express.json())
server.use(express.urlencoded({ extended: false }))


server.use(util.logRequest)

homeController.get('/', (req, res) => {
  res.sendFile('index.html', { root: config.ROOT })
})

server.use(homeController)
server.use(memberController)

// catch all middleware
server.use((req, res, next) => {
  res.status(404).sendFile('404.html', { root: config.ROOT })
})

// Initialize MongoDB and then start the server
initMongoDB().then(() => {
  server.listen(config.PORT, "localhost", () => {
    console.log(`\t|Server listening on ${config.PORT}`)
  })
}).catch(err => {
  console.error("Failed to start server:", err)
})