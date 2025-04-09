(() => {
    
    const User = (username, hashedPassword, role = null) => {
      
        const Roles = {
            ADMIN: {
                name: 'admin',
                level: 3,
                description: 'Full system access'
            },
            MEMBER: {
                name: 'member',
                level: 2,
                description: 'Standard user access'
            },
            GUEST: {
                name: 'guest',
                level: 1,
                description: 'Limited access'
            }
        }

       
        const userRole = role && Roles[role.toUpperCase()] 
            ? Roles[role.toUpperCase()].name 
            : Roles.MEMBER.name

        return {
            username: username,
            password: hashedPassword,
            role: userRole,
            roleDetails: Roles[userRole.toUpperCase()],
            createdAt: new Date().toUTCString(),
            lastLogin: null,
            isActive: true,
            
            
            
            
        }
    }

   
    User.validateRole = (role) => {
        const Roles = {
            ADMIN: 'admin',
            MEMBER: 'member',
            GUEST: 'guest'
        }
        return Object.values(Roles).includes(role)
    }

    module.exports = User
})()