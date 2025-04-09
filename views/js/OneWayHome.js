(() => {
    // Basic One-Way Hash Function
    function basicHash(input) {
        let hash = 0;

        
        if (input.length === 0) return "00000000";

       
        for (let i = 0; i < input.length; i++) {
           
            const char = input.charCodeAt(i);

           
           
            hash = ((hash << 5) - hash) + char;

           
            hash = hash & hash;
        }

       
        let hexHash = (hash >>> 0).toString(16);

       
        while (hexHash.length < 8) {
            hexHash = "0" + hexHash;
        }

        return hexHash;
    }

    
    const messageInput = document.getElementById('message-input');
    const hashButton = document.getElementById('hash-button');
    const hashResult = document.getElementById('hash-result');

    
    hashButton.addEventListener('click', function () {
        const message = messageInput.value;

        if (!message) {
            hashResult.textContent = 'Please enter a message to hash';
            return;
        }

        const result = basicHash(message);
        hashResult.textContent = result;
    });

    
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    if (registerBtn && document.getElementById('registerForm')) {
        registerBtn.addEventListener('click', function () {
            document.getElementById('registerForm').style.display = 'flex';
            if (document.getElementById('loginForm')) {
                document.getElementById('loginForm').style.display = 'none';
            }
            if (document.getElementById('welcome')) {
                document.getElementById('welcome').style.display = 'none';
            }
        });
    }

    if (loginBtn && document.getElementById('loginForm')) {
        loginBtn.addEventListener('click', function () {
            if (document.getElementById('registerForm')) {
                document.getElementById('registerForm').style.display = 'none';
            }
            document.getElementById('loginForm').style.display = 'flex';
            if (document.getElementById('welcome')) {
                document.getElementById('welcome').style.display = 'none';
            }
        });
    }
})()

