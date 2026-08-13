document.addEventListener('DOMContentLoaded', async () => {
    console.log('Welcome to Roe and Sons website!');

    try {
        const response = await fetch('gallery.json');
        const galleryData = await response.json();
        
        const galleryContainer = document.getElementById('gallery-grid');
        if (!galleryContainer) return;

        const limitAttr = galleryContainer.getAttribute('data-limit');
        const limit = limitAttr ? parseInt(limitAttr, 10) : galleryData.length;

        const itemsToShow = galleryData.slice(0, limit);

        itemsToShow.forEach((item, index) => {
        let html = '';

                if (item.type === 'image') {
            html = `
                <a href="${item.src}" 
                   class="gallery-item" 
                   target="_blank">
                    <img src="${item.src}" alt="${item.title}" onload="this.parentElement.setAttribute('data-pswp-width', this.naturalWidth); this.parentElement.setAttribute('data-pswp-height', this.naturalHeight);" />
                    <div class="gallery-item-info">
                        <div class="gallery-item-title">${item.title}</div>
                        <div class="gallery-item-desc">${item.description}</div>
                    </div>
                </a>
            `;
        } else if (item.type === 'video') {
             html = `
                <a href="#" 
                   class="gallery-item video-item" 
                   data-video-url="${item.videoUrl}"
                   data-pswp-type="custom"
                   data-pswp-width="1280" 
                   data-pswp-height="720">
                    <img src="${item.thumbnail}" alt="${item.title}" />
                    
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3.3333rem; color: white; opacity: 0.8;">▶</div>
                    <div class="gallery-item-info">
                        <div class="gallery-item-title">${item.title}</div>
                        <div class="gallery-item-desc">${item.description}</div>
                    </div>
                </a>
            `;
        }

        galleryContainer.innerHTML += html;
    });

    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-grid',
        children: '.gallery-item',
        pswpModule: PhotoSwipe
    });

    lightbox.on('uiRegister', function() {
      lightbox.pswp.ui.registerElement({
        name: 'custom-caption',
        order: 9,
        isButton: false,
        appendTo: 'root',
        html: 'Caption text',
        onInit: (el, pswp) => {
          lightbox.pswp.on('change', () => {
            const currSlideElement = lightbox.pswp.currSlide.data.element;
            let captionText = '';
            if (currSlideElement) {
                const title = currSlideElement.querySelector('.gallery-item-title').innerHTML;
                const desc = currSlideElement.querySelector('.gallery-item-desc').innerHTML;
                captionText = `<strong>${title}</strong><br>${desc}`;
            }
            el.innerHTML = captionText || '';
            if (captionText) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
          });
        }
      });
    });

    lightbox.addFilter('itemData', (itemData, index) => {
        const element = itemData.element;
        if (element && element.dataset.videoUrl) {
            itemData.html = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <iframe src="${element.dataset.videoUrl}" width="100%" height="100%" style="max-width: 80rem; max-height: 45rem; border: none;" allow="autoplay; fullscreen"></iframe>
                </div>
            `;
        }
        return itemData;
    });

    lightbox.init();

    } catch (error) {
        console.error('Error loading gallery data:', error);
    }

    // Contact form
    const form = document.getElementById('contact-form');
    const result = document.getElementById('form-result');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = document.getElementById('email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(emailInput)) {
                result.innerHTML = "Please enter a valid email address so we can reply to you.";
                result.style.color = "red";
                
                document.getElementById('email').focus();
                return;
            }

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            result.innerHTML = "Sending your message... Please wait.";
            result.style.color = "var(--navy)";

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    result.innerHTML = "Success! Thank you for contacting us. We will reach out to you soon.";
                    result.style.color = "var(--green)";
                    form.reset();
                } else {
                    console.log(response);
                    result.innerHTML = "Sorry, something went wrong. Please call us instead.";
                    result.style.color = "red";
                }
            })
            .catch(error => {
                console.log(error);
                result.innerHTML = "Sorry, something went wrong. Please call us instead.";
                result.style.color = "red";
            });
        });
    }
});