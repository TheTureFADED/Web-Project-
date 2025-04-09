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
        const post = await getJsonData(`/post/${id}`)
        console.info(post.post)
        
        // Populate post details
        Object.keys(post.post).forEach(key => {
            let element = document.querySelector(`input#${key}`)
            if(element) element.value = post.post[key]
            else {
                let textElement = document.querySelector(`#${key}`)
                if (textElement) textElement.innerHTML = post.post[key]
            }
        })
        
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