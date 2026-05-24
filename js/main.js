document.addEventListener('DOMContentLoaded', async () => {
    // Determine base path based on the script tag src
    const scriptTag = document.querySelector('script[src$="js/main.js"]');
    const basePath = scriptTag ? scriptTag.getAttribute('src').replace('js/main.js', '') : './';
    
    // Fetch and build navigation
    try {
        const response = await fetch(basePath + 'nav.json');
        const navData = await response.json();
        const navMenu = document.querySelector('.nav-menu');
        
        if (navMenu && navData.length > 0) {
            navMenu.innerHTML = ''; // Clear existing
            
            navData.forEach(item => {
                const li = document.createElement('li');
                const isExternal = item.url.startsWith('http');
                const itemUrl = isExternal ? item.url : basePath + item.url;
                const targetAttr = item.target ? `target="${item.target}"` : '';
                
                if (item.subsections && item.subsections.length > 0) {
                    li.classList.add('dropdown');
                    
                    let subHtml = `<ul class="dropdown-menu">`;
                    item.subsections.forEach(sub => {
                        const subIsExternal = sub.url.startsWith('http');
                        const subUrl = subIsExternal ? sub.url : basePath + sub.url;
                        subHtml += `<li><a href="${subUrl}" class="dropdown-item">${sub.title}</a></li>`;
                    });
                    subHtml += `</ul>`;
                    
                    li.innerHTML = `<a href="${itemUrl}" class="nav-link" ${targetAttr}>${item.title}</a>` + subHtml;
                } else {
                    li.innerHTML = `<a href="${itemUrl}" class="nav-link" ${targetAttr}>${item.title}</a>`;
                }
                
                navMenu.appendChild(li);
            });
        }
    } catch (e) {
        console.error('Failed to load navigation', e);
    }

    // Mobile Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking a link (mobile)
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Active Link Highlighting based on current URL
    const currentUrl = window.location.href;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const hrefAttr = link.getAttribute('href');
        if (!hrefAttr) return;
        const normalizedHref = hrefAttr.replace(basePath, ''); // Remove base path for comparison
        
        if (currentUrl === link.href || (currentUrl.endsWith('/') && normalizedHref === 'index.html')) {
            link.classList.add('active');
        } else if (currentUrl.includes(normalizedHref) && normalizedHref !== 'index.html') {
            link.classList.add('active');
        }
    });

    // Lightbox Logic
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;
    const images = Array.from(document.querySelectorAll('.gallery-item img')).map(img => img.src);

    if (galleryItems.length > 0) {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                showImage(currentIndex);
                lightbox.classList.add('active');
            });
        });

        const showImage = (index) => {
            lightboxImg.src = images[index];
        };

        const nextImage = () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        };

        const prevImage = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        };

        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
        if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));

        // Close on clicking overlay
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') lightbox.classList.remove('active');
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }
});
