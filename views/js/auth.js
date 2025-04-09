
(() => {
    
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/check-session');
            const data = await response.json();
            
            if (data.isLoggedIn) {
                
                const authButtons = document.getElementById('aa');
                if (authButtons) {
                    authButtons.innerHTML = `
                        <span class="text-white me-2">Welcome, ${data.user.username}</span>
                        <button class="btn btn-outline-secondary" id="logout-btn">Logout</button>
                    `;
                    document.getElementById('logout-btn').addEventListener('click', logout);
                }
                
                
                if (data.user.role === 'admin') {
                    const roleBadge = document.createElement('span');
                    roleBadge.className = 'badge bg-danger ms-2';
                    roleBadge.textContent = 'Admin';
                    authButtons.querySelector('span').appendChild(roleBadge);
                } else if (data.user.role === 'member') {
                    const roleBadge = document.createElement('span');
                    roleBadge.className = 'badge bg-success ms-2';
                    roleBadge.textContent = 'Member';
                    authButtons.querySelector('span').appendChild(roleBadge);
                }
                
                
                updateElementVisibility(data.user.role);
                
                return data.user;
            } else {
                
                updateElementVisibility('guest');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            updateElementVisibility('guest');
        }
        
        return { authenticated: false, role: 'guest' };
    };
    
    
    const updateElementVisibility = (role) => {
       
        const memberOnlyElements = document.querySelectorAll('.member-only');
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        
        if (role === 'guest') {
            memberOnlyElements.forEach(el => el.style.display = 'none');
            adminOnlyElements.forEach(el => el.style.display = 'none');
        } else if (role === 'member') {
            memberOnlyElements.forEach(el => el.style.display = '');
            adminOnlyElements.forEach(el => el.style.display = 'none');
        } else if (role === 'admin') {
            memberOnlyElements.forEach(el => el.style.display = '');
            adminOnlyElements.forEach(el => el.style.display = '');
        }
    };
    
  
    const logout = async () => {
        try {
            await fetch('/logout', { method: 'GET' });
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

   
    window.authUtils = {
        checkAuthStatus,
        getCurrentRole: async () => {
            const user = await checkAuthStatus();
            return user.role || 'guest';
        },
        getCurrentUsername: async () => {
            const user = await checkAuthStatus();
            return user.username || null;
        },
        logout
    };
    
    
    document.addEventListener('DOMContentLoaded', () => {
       
        const yearSpan = document.querySelector('footer>kbd>span');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        
        checkAuthStatus();

       
        const logoutButtons = document.querySelectorAll('#logout-btn, [data-action="logout"]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', logout);
        });
    });
})();