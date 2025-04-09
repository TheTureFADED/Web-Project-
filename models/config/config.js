//mongodb+srv://mbouguerra:<db_password>@summer.hnqug.mongodb.net/?retryWrites=true&w=majority&appName=summer


// mongodb+srv://Faded:<db_password>@cluster0.suk4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
(() => {
    const config = {}
    config.SERVER = 'cluster0.suk4a.mongodb.net'
    config.USERNAME = 'Faded'
 
    config.PASSWORD = 'AFAllen4799'
    config.DATABASE = 'Foruma'
    
    // Add database collections configuration
    config.COLLECTIONS = {
        USERS: 'Users',
        POSTS: 'Posts',
        REQUESTS: 'Requests'
    }

    module.exports = config
})()