
(() => {    
  const setCopyrightYear = () => {
      const yearSpan = document.querySelector('footer>kbd>span');
      if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
      } else {
          console.warn('Could not find year span element');
      }
  }

  const setHead = () => {
      const head = document.querySelector('head');
      if (!head) {
          console.error('Head element not found');
          return;
      }

      
      const existingMetas = head.querySelectorAll('meta, title, link[rel="shortcut icon"]');
      existingMetas.forEach(meta => meta.remove());

      
      const metaConfigs = [
          { charset: 'UTF-8' },
          { 'http-equiv': 'X-UA-Compatible', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ];

      metaConfigs.forEach(config => {
          const meta = document.createElement('meta');
          Object.entries(config).forEach(([key, value]) => {
              if (key === 'charset') {
                  meta.setAttribute(key, value);
              } else {
                  meta.setAttribute(key, value);
              }
          });
          head.appendChild(meta);
      });

      
      const title = document.createElement('title');
      title.textContent = 'Using MongoDB';
      head.appendChild(title);

      
      const favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      favicon.href = 'img/question.png';
      favicon.type = 'image/x-icon';
      head.appendChild(favicon);

      
      const luxCSS = document.createElement('link');
      luxCSS.rel = 'stylesheet';
      luxCSS.href = 'css/lux.css';
      head.appendChild(luxCSS);
  }

  const setNavbar = () => {
     
      const header = document.querySelector('header');
      
      if (!header) {
          console.error('No header element found in the document');
          return;
      }

      
      const existingNavbar = header.querySelector('nav');
      if (existingNavbar) {
          existingNavbar.remove();
      }

     
      const navbar = document.createElement('nav');
      navbar.className = 'navbar navbar-expand-lg bg-primary';
      navbar.setAttribute('data-bs-theme', 'dark');
      
     
      navbar.innerHTML = `
      <div class="container-fluid">
          <a class="navbar-brand" href="#"></a>
          <button
              class="navbar-toggler collapsed d-flex d-lg-none flex-column justify-content-around"
              type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false"
              aria-label="Toggle navigation">
              <span class="toggler-icon top-bar"></span>
              <span class="toggler-icon middle-bar"></span>
              <span class="toggler-icon bottom-bar"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                  <li class="nav-item">
                      <a class="nav-link active"
                          aria-current="page"
                          href="index.html">Securish</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="oneWay.html">One Way Hash</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="RSA.html">RSA</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="about.html">About</a>
                  </li>
              </ul>
              
              <div class="btn-group" role="group"
                  aria-label="Registration and Login" id="aa">
                  <button class="btn btn-outline-secondary"
                      id="register">
                      Register
                  </button>
                  <br>
                  <button class="btn btn-outline-secondary"
                      id="login">
                      Log in
                  </button>
              </div>
          </div>
      </div>`;
      
      
      header.appendChild(navbar);
  }

  const setFooter = () => {
     
      const footerElements = document.querySelectorAll('footer');
      const lastFooter = footerElements[footerElements.length - 1];
      
      if (!lastFooter) {
          console.error('No footer element found');
          return;
      }

      
      lastFooter.classList.add('text-center');
      
      
      let yearSpan = lastFooter.querySelector('kbd > span');
      if (!yearSpan) {
          const kbd = document.createElement('kbd');
          kbd.setAttribute('role', 'contentinfo');
          kbd.innerHTML = `&copy; <span>${new Date().getFullYear()}</span>. M. Bouguerra. All rights reserved`;
          lastFooter.appendChild(kbd);
      } else {
          yearSpan.textContent = new Date().getFullYear();
      }
  }

  
  document.addEventListener('DOMContentLoaded', () => {
      try {
          setHead();
          setNavbar();
          setFooter();
          setCopyrightYear();
      } catch (error) {
          console.error('Error setting up page partials:', error);
      }
  });
})()