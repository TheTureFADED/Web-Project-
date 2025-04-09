(() => {
   
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const isStrongPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

  
    const toggleForms = (showForm) => {
        const registerForm = document.getElementById('registerForm');
        const loginForm = document.getElementById('loginForm');
        const welcomeSection = document.getElementById('welcome');

       
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (welcomeSection) welcomeSection.style.display = 'none';

     
        if (showForm === 'register' && registerForm) {
            registerForm.style.display = 'block';
        } else if (showForm === 'login' && loginForm) {
            loginForm.style.display = 'block';
        }
    }

    
    const displayError = (errorSpan, message) => {
        if (errorSpan) {
            errorSpan.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
            
            setTimeout(() => {
                errorSpan.innerHTML = '';
            }, 5000);
        }
    }

   
    const handleRegister = async (event) => {
        event.preventDefault();
        
        const emailInput = document.querySelector('#registerForm input[name="email"]');
        const passwordInput = document.querySelector('#registerForm input[name="password"]');
        const confirmInput = document.querySelector('#registerForm input[name="confirm"]');
        const errorSpan = document.querySelector('#registerForm #signup-error');
        
       
        if (!emailInput || !passwordInput || !confirmInput) {
            displayError(errorSpan, 'Form inputs are missing');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        
        
        if (errorSpan) errorSpan.innerHTML = '';
        
        
        if (!email) {
            displayError(errorSpan, 'Email is required');
            return;
        }
        
        if (!isValidEmail(email)) {
            displayError(errorSpan, 'Invalid email format');
            return;
        }
        
        if (password !== confirm) {
            displayError(errorSpan, 'Passwords do not match');
            return;
        }
        
        if (!isStrongPassword(password)) {
            displayError(errorSpan, 'Weak password. Use at least 8 characters with uppercase, lowercase, and number');
            return;
        }
        
        try {
            
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Registering...';
            }

            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, confirm })
            });
            
            const data = await response.json();
            
            if (data.success) {
                
                window.location.href = '/member.html';
            } else {
                
                displayError(errorSpan, data.message || 'Registration failed');
                
                
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Register';
                }
            }
        } catch (error) {
            console.error('Registration Error:', error);
            displayError(errorSpan, `Error: ${error.message}`);
            
            
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Register';
            }
        }
    }

   
    const handleLogin = async (event) => {
        event.preventDefault();        
        
        const emailInput = document.querySelector('#loginForm input[type="email"]');
        const passwordInput = document.querySelector('#loginForm input[type="password"]');
        const errorSpan = document.querySelector('#signin-error');
        
        if (!emailInput || !passwordInput) {
            displayError(errorSpan, 'Login inputs not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
       
        if (errorSpan) errorSpan.innerHTML = '';
        
        
        if (!isValidEmail(email)) {
            displayError(errorSpan, 'Invalid email format');
            return;
        }
        
        try {
            
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Logging in...';
            }

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                
                window.location.href = '/member.html';
            } else {
                
                displayError(errorSpan, data.message || 'Login failed');
                
                
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Login';
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            displayError(errorSpan, `Error: ${error.message}`);
            
            
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
            }
        }
    }

    
    document.addEventListener('DOMContentLoaded', () => {
       
        const registerForm = document.querySelector('#registerForm form');
        const loginForm = document.querySelector('#loginForm form');
        
       
        const registerBtn = document.getElementById('register');
        const loginBtn = document.getElementById('login');
        
        
        const registerFormDiv = document.getElementById('registerForm');
        const loginFormDiv = document.getElementById('loginForm');
        const welcomeSection = document.getElementById('welcome');

       
        if (registerFormDiv) registerFormDiv.style.display = 'none';
        if (loginFormDiv) loginFormDiv.style.display = 'none';

        
        if (welcomeSection) welcomeSection.style.display = 'block';

       
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => toggleForms('register'));
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => toggleForms('login'));
        }
    });
})();