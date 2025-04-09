
(() => {
    
    const { encrypt, decrypt, p, q, n, e, d } = window.rsaUtils || {};
    
 
    const createSecurePost = async (event) => {
        event.preventDefault();
        
        
        const topic = document.getElementById('topic').value;
        const message = document.getElementById('message').value;
        
       
        if (!topic || topic === 'Select a topic' || !message) {
            alert('Please select a topic and enter a message');
            return;
        }
        
        try {
            
            const role = await window.authUtils.getCurrentRole();
            if (role === 'guest') {
                alert('You must be logged in to create posts');
                return;
            }
            
            
            const encryptedChars = [];
            for (let i = 0; i < message.length; i++) {
                const char = message[i];
                const ascii = char.charCodeAt(0);
                
                if (ascii >= n) {
                    alert(`Character "${char}" has ASCII value ${ascii}, which is too large (must be < ${n})`);
                    return;
                }
                
                const encrypted = encrypt(ascii);
                encryptedChars.push(encrypted);
            }
            
          
            const encryptedMessage = encryptedChars.join(',');
            
            
            const response = await fetch('/addPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    message,
                    encryptedMessage
                })
            });
            
            if (response.ok) {
                window.location.href = '/posts.html';
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post');
        }
    };
    
    
    document.addEventListener('DOMContentLoaded', () => {
        const postForm = document.querySelector('form[action="addPost"]');
        if (postForm) {
            postForm.addEventListener('submit', createSecurePost);
        }
    });
})();