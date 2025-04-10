// using IIFE
(() => {
    const setCopyrightYear = () => {
        document.querySelector('footer>kbd>span').innerHTML = new Date().getFullYear()
    }

    /**----------------------------------------------------
    Utility functions
    -----------------------------------------------------*/
    const getJsonData = async (url) => {
        try {
            console.info('getJsonData', url)
            const response = await fetch(url)
            console.info(response)
            const data = await response.json()
            return data
        } catch (err) {
            console.error(err)
        }
    }

   // Updated deletePost function with better error handling
const deletePost = async (postId) => {
    if (!postId) return;
  
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
  
    try {
        console.log(`Attempting to delete post with ID: ${postId}`);
        
        const response = await fetch(`/deletePostAlt/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Empty body, but needed for POST request
        });
        
        // Check the content type of the response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML response instead of JSON');
            alert('Server error: Received HTML instead of JSON response');
            return;
        }
        
        // Try to parse the response as JSON
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            alert('Server returned an invalid response format');
            return;
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Unknown error');
        }
        
        // Show success message
        alert('Post deleted successfully');
        
        // Return to posts view and refresh
        document.querySelector('#post').style.display = 'none';
        document.querySelector('#posts').style.display = 'block';
        displayPosts();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
    }
};

    // Function to update a post
    const updatePost = async (postId, topic, message) => {
        if (!postId || !topic || !message) return;
      
        try {
            const response = await fetch(`/updatePost/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, message })
            });
          
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error updating post');
            }
          
            // Show success message
            alert('Post updated successfully');
          
            // Reload the post details
            displayPostDetails(postId);
          
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Error updating post: ' + error.message);
        }
    };

    /**----------------------------------------------------
    Post Display Functions
    -----------------------------------------------------*/
    const displayPosts = async () => {
        const posts = await getJsonData('/posts')
        if (posts.length > 0) {
            console.info("Posts:", posts)
            console.info("Displaying posts")
            let header = document.querySelector('#header')
            let thead = document.querySelector('thead')
            let tbody = document.querySelector('tbody')
            
            // Clear previous content
            thead.innerHTML = ''
            tbody.innerHTML = ''
            
            const columns = Object.keys(posts[0])
            let tr = document.createElement('tr')
            tr.setAttribute('class', 'text-center h3')
            columns.push(' ')
            columns.forEach(column => {
                let th = document.createElement('th')
                th.textContent = column === "Message" ? "Message Snippet" : column
                th.textContent = column === "_id" ? "#" : th.textContent
                tr.appendChild(th)
            })
            thead.appendChild(tr)

            for (let i = 0; i < posts.length; i++) {
                let tr = document.createElement('tr')
                let rows = []
                columns.forEach(column => {
                    rows.push(document.createElement('td'))
                })
               
                for (let j = 0; j < rows.length; ++j) {
                    if (j== 0) rows[j].innerHTML = `<kbd>${i+1}</kbd>`
                    else if (j === rows.length - 1) {
                        let details = document.createElement('button')
                        details.setAttribute('class','btn btn-outline-warning')
                        details.innerHTML = 'View Post Details'
                        rows[j].appendChild(details)
                        details.onclick = () => displayPostDetails(posts[i][columns[0]])
                    }
                    else if (columns[j] === "Message") rows[j].innerHTML = `${posts[i][columns[j]].slice(0, 10)} ...`
                    else rows[j].innerHTML = posts[i][columns[j]]
                    tr.appendChild(rows[j])
                }
                tbody.appendChild(tr)
            }
        } else {
            console.info(`Posts collection is empty`)
        }
    }

    const displayDetails = () => {
        document.querySelector('#post').style.display = 'block'
        document.querySelector('#posts').style.display = 'none'
    }

    const displayPostDetails = async (id) => {
        const postData = await getJsonData(`/post/${id}`)
        console.info(postData.post)
        
        // Populate post details
        Object.keys(postData.post).forEach(key => {
            let element = document.querySelector(`input#${key}`)
            if(element) element.value = postData.post[key]
            else {
                let textElement = document.querySelector(`#${key}`)
                if (textElement) textElement.innerHTML = postData.post[key]
            }
        })
        
        // Get the current user's role to determine if edit/delete buttons should be shown
        try {
            const sessionResponse = await fetch('/check-session')
            const sessionData = await sessionResponse.json()
            
            if (sessionData.isLoggedIn) {
                const userRole = sessionData.user.role
                const username = sessionData.user.username
                
                const editButton = document.getElementById('editButton')
                const deleteButton = document.getElementById('deleteButton')
                
                // If user is an admin or the post owner, show the edit/delete buttons
                const isAdmin = userRole === 'admin'
                const isPostOwner = username === postData.post.By
                
                if (editButton) {
                    editButton.style.display = (isAdmin || isPostOwner) ? 'inline-block' : 'none'
                    editButton.setAttribute('data-id', postData.post._id)
                    
                    // Remove any existing event listener
                    editButton.replaceWith(editButton.cloneNode(true))
                    
                    // Add new event listener
                    document.getElementById('editButton').addEventListener('click', () => {
                        // Make post fields editable
                        const topicInput = document.getElementById('Topic')
                        const messageInput = document.getElementById('Message')
                        
                        if (topicInput) topicInput.readOnly = false
                        if (messageInput) messageInput.readOnly = false
                        
                        // Change edit button to save button
                        const editBtn = document.getElementById('editButton')
                        editBtn.textContent = 'Save Changes'
                        editBtn.className = 'btn btn-success member-only'
                        
                        // Remove old click handler and add new one for saving
                        editBtn.replaceWith(editBtn.cloneNode(true))
                        document.getElementById('editButton').addEventListener('click', () => {
                            const updatedTopic = topicInput.value
                            const updatedMessage = messageInput.value
                            
                            updatePost(postData.post._id, updatedTopic, updatedMessage)
                        })
                    })
                }
                
                if (deleteButton) {
                    deleteButton.style.display = (isAdmin || isPostOwner) ? 'inline-block' : 'none'
                    deleteButton.setAttribute('data-id', postData.post._id)
                    
                    // Remove any existing event listener
                    deleteButton.replaceWith(deleteButton.cloneNode(true))
                    
                    // Add new event listener
                    document.getElementById('deleteButton').addEventListener('click', () => {
                        deletePost(postData.post._id)
                    })
                }
            }
        } catch (error) {
            console.error('Error checking user role:', error)
        }
        
        displayDetails()         
    }

    // Back to messages functionality
    const setupBackButton = () => {
        const backButton = document.getElementById('backButton')
        if (backButton) {
            backButton.addEventListener('click', () => {
                document.querySelector('#post').style.display = 'none'
                document.querySelector('#posts').style.display = 'block'
            })
        }
    }

    // Initialize page
    window.onload = () => {
        setCopyrightYear()
        document.querySelector('#post').style.display = 'none'
        document.querySelector('#posts').style.display = 'block'
        displayPosts()
        setupBackButton()
    }
})()