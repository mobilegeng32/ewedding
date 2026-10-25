document.addEventListener('DOMContentLoaded', () => {
  
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP5CFIHTFg9lJNzupWptbtYGECjOwOCIsqei6IpcUBcySKPuL0wZyeiRM1tbo76t2R/exec';
  
  /* -------------------------------------------------------------
     1. SISTEM CONFIG & DINAMIK DATA
  ------------------------------------------------------------- */
  function parseGuestNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('n') || urlParams.get('nama');
    const guestNameEl = document.getElementById('dyn-guest-name') || document.querySelector('.glass-card .font-medium.text-purpleTheme-900');

    if (guestName && guestNameEl) {
      const cleanName = decodeURIComponent(guestName.replace(/\+/g, ' ')).trim();
      if (cleanName.length > 0) {
        guestNameEl.innerText = cleanName;
      }
    }
  }
  parseGuestNameFromURL();

  function fetchSiteConfig() {
    if (!SCRIPT_URL.includes('http')) return;

    fetch(`${SCRIPT_URL}?action=config`)
      .then(res => res.json())
      .then(config => {
        if (!config) return;

        if (config.bride_fullname && document.getElementById('dyn-bride-fullname')) document.getElementById('dyn-bride-fullname').innerText = config.bride_fullname;
        if (config.bride_desc && document.getElementById('dyn-bride-desc')) document.getElementById('dyn-bride-desc').innerText = config.bride_desc;
        if (config.groom_fullname && document.getElementById('dyn-groom-fullname')) document.getElementById('dyn-groom-fullname').innerText = config.groom_fullname;
        if (config.groom_desc && document.getElementById('dyn-groom-desc')) document.getElementById('dyn-groom-desc').innerText = config.groom_desc;

        if (config.event_date && document.getElementById('dyn-event-date')) document.getElementById('dyn-event-date').innerHTML = `<i class="far fa-calendar-alt text-purpleTheme-700 mr-2"></i> ${config.event_date}`;
        if (config.event_time && document.getElementById('dyn-event-time')) document.getElementById('dyn-event-time').innerHTML = `<i class="far fa-clock text-purpleTheme-700 mr-2"></i> ${config.event_time}`;
        if (config.event_location && document.getElementById('dyn-event-location')) document.getElementById('dyn-event-location').innerHTML = `<i class="fas fa-map-marker-alt text-purpleTheme-700 mr-2"></i> ${config.event_location}`;

        if (config.gmaps_url && document.getElementById('dyn-gmaps-link')) document.getElementById('dyn-gmaps-link').href = config.gmaps_url;
        if (config.waze_url && document.getElementById('dyn-waze-link')) document.getElementById('dyn-waze-link').href = config.waze_url;

        if (config.contact1_name && document.getElementById('dyn-c1-name')) {
          document.getElementById('dyn-c1-name').innerText = config.contact1_name;
          document.getElementById('dyn-c1-rel').innerText = config.contact1_relation || '';
          document.getElementById('dyn-c1-tel').href = `tel:${config.contact1_phone}`;
          document.getElementById('dyn-c1-wa').href = `https://wa.me/${config.contact1_phone}?text=Assalamualaikum`;
        }
        if (config.contact2_name && document.getElementById('dyn-c2-name')) {
          document.getElementById('dyn-c2-name').innerText = config.contact2_name;
          document.getElementById('dyn-c2-rel').innerText = config.contact2_relation || '';
          document.getElementById('dyn-c2-tel').href = `tel:${config.contact2_phone}`;
          document.getElementById('dyn-c2-wa').href = `https://wa.me/${config.contact2_phone}?text=Assalamualaikum`;
        }

        const maxPax = parseInt(config.max_pax) || 5;
        const paxSelect = document.getElementById('rsvp-pax');
        if (paxSelect) {
          paxSelect.innerHTML = ''; 
          for (let i = 1; i <= maxPax; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i} Orang`;
            paxSelect.appendChild(opt);
          }
        }

        applyFeatureToggles(config);
      })
      .catch(err => console.log("Gagal memuatkan config:", err));
  }

  function applyFeatureToggles(config) {
    const rsvpBtn = document.querySelector('#rsvp-form button[type="submit"]');
    if (config.control_RSVP !== undefined && rsvpBtn) {
      if (String(config.control_RSVP).toUpperCase() === 'FALSE') {
        rsvpBtn.disabled = true;
        rsvpBtn.className = "w-full bg-gray-400 text-white font-medium py-3.5 rounded-xl text-sm opacity-50 cursor-not-allowed";
        rsvpBtn.innerText = "RSVP DITUTUP";
      }
    }
    const uploadBtn = document.getElementById('btn-upload-gallery');
    if (config.control_gallery !== undefined && uploadBtn) {
      if (String(config.control_gallery).toUpperCase() === 'FALSE') {
        uploadBtn.className = "cursor-not-allowed bg-gray-300 text-gray-600 font-medium px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 opacity-50 pointer-events-none";
        uploadBtn.innerHTML = `<i class="fas fa-lock"></i> Muat Naik Ditutup`;
      }
    }
    const wishBtn = document.getElementById('btn-submit-wish');
    if (config.control_wish !== undefined && wishBtn) {
      if (String(config.control_wish).toUpperCase() === 'FALSE') {
        wishBtn.disabled = true;
        wishBtn.className = "w-full bg-gray-400 text-white font-semibold py-4 rounded-xl text-xs opacity-50 cursor-not-allowed";
        wishBtn.innerText = "UCAPAN DITUTUP";
      }
    }
  }

  fetchSiteConfig();

  /* -------------------------------------------------------------
     2. PENGURUSAN CUSTOM MODAL PENGESAHAN (100% CUSTOM HTML)
  ------------------------------------------------------------- */
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmDesc = document.getElementById('confirm-desc');
  const dialogYesBtn = document.getElementById('dialog-yes-btn');
  const dialogCancelBtn = document.getElementById('dialog-cancel-btn');

  function showConfirmDialog(title, desc, onConfirm) {
    if (!confirmModal) {
      onConfirm();
      return;
    }

    if (confirmTitle) confirmTitle.innerText = title;
    if (confirmDesc) confirmDesc.innerText = desc;
    confirmModal.classList.remove('hidden');

    const newYesBtn = dialogYesBtn.cloneNode(true);
    const newCancelBtn = dialogCancelBtn.cloneNode(true);
    dialogYesBtn.parentNode.replaceChild(newYesBtn, dialogYesBtn);
    dialogCancelBtn.parentNode.replaceChild(newCancelBtn, dialogCancelBtn);

    newYesBtn.addEventListener('click', () => {
      confirmModal.classList.add('hidden');
      onConfirm();
    });

    newCancelBtn.addEventListener('click', () => {
      confirmModal.classList.add('hidden');
    });
  }


  /* -------------------------------------------------------------
     3. FUNGSI RSVP & KAWALAN PAX
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpStatus = document.getElementById('rsvp-status');
  const paxContainer = document.getElementById('pax-container');
  const rsvpPax = document.getElementById('rsvp-pax');

  function updatePaxVisibility() {
    if (rsvpStatus && paxContainer) {
      if (rsvpStatus.value === 'Hadir') {
        paxContainer.classList.remove('hidden');
        if (rsvpPax && !rsvpPax.value) rsvpPax.value = "1";
      } else {
        paxContainer.classList.add('hidden');
        if (rsvpPax) rsvpPax.value = "0";
      }
    }
  }

  if (rsvpStatus) {
    rsvpStatus.addEventListener('change', updatePaxVisibility);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      showConfirmDialog(
        "Hantar Pengesahan RSVP?",
        "Adakah anda pasti maklumat kehadiran yang dimasukkan sudah betul?",
        () => {
          const submitBtn = rsvpForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerText;
          submitBtn.innerText = "Sedang Hantar...";
          submitBtn.disabled = true;

          const formData = new URLSearchParams();
          formData.append('action', 'rsvp');
          formData.append('name', document.getElementById('rsvp-name').value);
          formData.append('phone', document.getElementById('rsvp-phone').value);
          formData.append('status', document.getElementById('rsvp-status').value);
          formData.append('pax', document.getElementById('rsvp-pax').value);
          
          fetch(`${SCRIPT_URL}?action=rsvp`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData 
          })
          .then(response => response.json())
          .then(data => {
            const alertBox = document.getElementById('rsvp-alert');
            if (data.status === "error") {
              if (alertBox) {
                alertBox.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}`;
                alertBox.classList.remove('hidden');
                setTimeout(() => { alertBox.classList.add('hidden'); }, 5000);
              }
            } else {
              if (alertBox) {
                alertBox.innerHTML = `<i class="fas fa-check-circle text-purpleTheme-700 text-lg mr-2"></i> Terima kasih! Pengesahan RSVP anda telah berjaya disimpan.`;
                alertBox.classList.remove('hidden');
                rsvpForm.reset();
                updatePaxVisibility(); // Pastikan state pax dikemaskini semula selepas reset
                setTimeout(() => { alertBox.classList.add('hidden'); }, 5000);
              }
            }
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
          })
          .catch(error => {
            console.error('RSVP Error:', error);
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
          });
        }
      );
    });
  }


  /* -------------------------------------------------------------
     4. FUNGSI GALLERY & UPLOAD MODAL
  ------------------------------------------------------------- */
  let selectedFileForUpload = null;
  const photoUpload = document.getElementById('photo-upload');
  const uploadModal = document.getElementById('upload-modal');
  const closeUploadModalBtn = document.getElementById('close-upload-modal');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const confirmUploadBtn = document.getElementById('confirm-upload-btn');
  const uploaderNameInput = document.getElementById('modal-uploader-name');
  const imageCaptionInput = document.getElementById('modal-image-caption');

  if (photoUpload) {
    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedFileForUpload = file;
        if (uploaderNameInput) uploaderNameInput.value = '';
        if (imageCaptionInput) imageCaptionInput.value = '';
        if (uploadModal) uploadModal.classList.remove('hidden');
      }
    });
  }

  function closeUploadModal() {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFileForUpload = null;
    if (photoUpload) photoUpload.value = '';
  }

  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);

  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', () => {
      if (!selectedFileForUpload) return;
      showConfirmDialog(
        "Muat Naik Gambar?",
        "Adakah anda pasti mahu memuat naik gambar ini ke galeri majlis?",
        () => {
          const uploaderName = uploaderNameInput.value.trim() || "Tetamu Undangan";
          const imageCaption = imageCaptionInput.value.trim() || "Kenangan Majlis";
          const galleryAlert = document.getElementById('gallery-alert');

          if (uploadModal) uploadModal.classList.add('hidden');
          if (galleryAlert) {
            galleryAlert.innerHTML = `<i class="fas fa-spinner fa-spin text-purpleTheme-700 text-lg mr-2"></i> Sedang memproses dan memuat naik gambar...`;
            galleryAlert.classList.remove('hidden');
          }

          const reader = new FileReader();
          reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
              const canvas = document.createElement('canvas');
              canvas.width = img.width; canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              const base64String = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

              const formData = new URLSearchParams();
              formData.append('action', 'gallery');
              formData.append('fileName', selectedFileForUpload.name.replace(/\.[^/.]+$/, "") + ".jpg");
              formData.append('mimeType', 'image/jpeg');
              formData.append('fileData', base64String);
              formData.append('name', uploaderName);
              formData.append('caption', imageCaption);
              
              fetch(`${SCRIPT_URL}?action=gallery`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData 
              })
              .then(response => response.json())
              .then(data => {
                if (data.status === "error") {
                  if (galleryAlert) {
                    galleryAlert.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}`;
                    setTimeout(() => galleryAlert.classList.add('hidden'), 5000);
                  }
                } else {
                  if (galleryAlert) {
                    galleryAlert.innerHTML = `<i class="fas fa-check-circle text-purpleTheme-700 text-lg mr-2"></i> Berjaya! Terima Kasih.`;
                    setTimeout(() => galleryAlert.classList.add('hidden'), 5000);
                  }
                  closeUploadModal();
                  fetchGalleryImages();
                }
              })
              .catch(error => {
                console.error('Upload error:', error);
                closeUploadModal();
              });
            };
          };
          reader.readAsDataURL(selectedFileForUpload);
        }
      );
    });
  }

  // Slideshow Gallery
  let defaultGallery = [{ url: "https://sites.create-cdn.net/siteimages/73/5/5/735562/21/1/9/21197176/1000x1000.jpg?1726336942", caption: "Detik Manis Bersama" }];
  let currentSlide = 0;
  let slideTimer = null;
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');

  function fetchGalleryImages(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          defaultGallery = data.map(item => ({ url: item.url, caption: `${item.caption} (Oleh: ${item.name})` }));
          if (!isBackgroundCheck) { currentSlide = 0; renderSlide(); }
        }
      })
      .catch(err => console.log("Gagal memuat galeri:", err));
  }

  function renderSlide() {
    if (!slideImg || !slideCaption || defaultGallery.length === 0) return;
    if (slideTimer) clearTimeout(slideTimer);
    if (currentSlide >= defaultGallery.length) currentSlide = 0;

    slideImg.src = defaultGallery[currentSlide].url;
    slideCaption.innerText = defaultGallery[currentSlide].caption;

    slideTimer = setTimeout(() => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide();
    }, 8000);
  }
  fetchGalleryImages();
  setInterval(() => fetchGalleryImages(true), 15000);


  /* -------------------------------------------------------------
     5. FUNGSI WISHES (BUKU HAJAT)
  ------------------------------------------------------------- */
  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name');
      const msgInput = document.getElementById('wish-message');

      if (nameInput.value && msgInput.value) {
        showConfirmDialog(
          "Hantar Ucapan & Doa?",
          "Adakah anda pasti mahu menghantar ucapan ini kepada pengantin?",
          () => {
            const submitBtn = wishForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Sedang Hantar...";
            submitBtn.disabled = true;

            const formData = new URLSearchParams();
            formData.append('action', 'wishes');
            formData.append('name', nameInput.value);
            formData.append('message', msgInput.value);
            
            fetch(`${SCRIPT_URL}?action=wishes`, { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formData 
            })
            .then(response => response.json())
            .then(data => {
              const wishAlert = document.getElementById('wish-alert');
              if (data.status === "error") {
                if (wishAlert) {
                  wishAlert.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}`;
                  wishAlert.classList.remove('hidden');
                  setTimeout(() => { wishAlert.classList.add('hidden'); }, 5000);
                }
              } else {
                nameInput.value = ''; msgInput.value = '';
                if (wishAlert) {
                  wishAlert.innerHTML = `Terima kasih! Ucapan dan doa restu anda telah berjaya direkodkan untuk pengantin. 🤍`;
                  wishAlert.classList.remove('hidden');
                  setTimeout(() => { wishAlert.classList.add('hidden'); }, 5000);
                }
                fetchWishes();
              }
              submitBtn.innerText = originalText;
              submitBtn.disabled = false;
            })
            .catch(error => {
              console.error('Wish Error:', error);
              submitBtn.innerText = originalText;
              submitBtn.disabled = false;
            });
          }
        );
      }
    });
  }

  function fetchWishes() {
    if (!SCRIPT_URL.includes('http')) return;
    fetch(`${SCRIPT_URL}?action=wishes`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('wishes-container');
        if (!container || !data) return;
        container.innerHTML = data.map(w => `
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purpleTheme-100 shadow-sm space-y-1.5">
            <div class="flex items-center justify-between border-b border-purpleTheme-50 pb-1.5">
              <h4 class="font-serif font-semibold text-purpleTheme-900 text-sm">${w.name}</h4>
              <span class="text-[10px] text-purpleTheme-700/60">${new Date(w.timestamp).toLocaleDateString('ms-MY', {day:'numeric', month:'short', year:'numeric'})}</span>
            </div>
            <p class="text-xs sm:text-sm text-purpleTheme-800/90 leading-relaxed font-light break-words">${w.message}</p>
          </div>
        `).join('');
      })
      .catch(err => console.log("Gagal memuat ucapan:", err));
  }
  fetchWishes();
  setInterval(() => fetchWishes(), 10000);


  /* -------------------------------------------------------------
     6. LAIN-LAIN: TENTATIVE, COUNTDOWN, AUDIO & FLOATING BAR
  ------------------------------------------------------------- */
  function fetchTentative() {
    if (!SCRIPT_URL.includes('http')) return;
    fetch(`${SCRIPT_URL}?action=tentative`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('dyn-tentative-container');
        if (!container || !data || data.length === 0) return;
        container.innerHTML = data.map(item => `
          <div class="relative">
            <span class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-purpleTheme-700 border-2 border-white"></span>
            <span class="text-xs font-semibold text-purpleTheme-700 bg-butter-100 px-2 py-0.5 rounded">${item.time}</span>
            <p class="text-sm font-medium text-purpleTheme-900 mt-1">${item.description}</p>
          </div>
        `).join('');
      })
      .catch(err => console.log("Tentative error:", err));
  }
  fetchTentative();

  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  let isPlaying = false;

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', () => {
      if (isPlaying) { bgMusic.pause(); isPlaying = false; musicIcon.className = 'fas fa-music text-purpleTheme-700/60'; }
      else { bgMusic.play(); isPlaying = true; musicIcon.className = 'fas fa-music fa-beat text-purpleTheme-700'; }
    });
  }

  const weddingDate = new Date('May 22, 2027 10:00:00').getTime();
  setInterval(() => {
    const now = new Date().getTime();
    const dist = weddingDate - now;
    if (dist > 0) {
      document.getElementById('cd-days').innerText = Math.floor(dist / (1000 * 60 * 60 * 24));
      document.getElementById('cd-hours').innerText = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      document.getElementById('cd-minutes').innerText = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
      document.getElementById('cd-seconds').innerText = Math.floor((dist % (1000 * 60)) / 1000);
    }
  }, 1000);

  const quickBar = document.getElementById('quick-action-bar');
  const musicContainer = document.getElementById('music-container');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      quickBar?.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      quickBar?.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      musicContainer?.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      musicContainer?.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    } else {
      quickBar?.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
      musicContainer?.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    }
  });

  const sections = ['invitation-section', 'details-section', 'rsvp-section', 'gallery-section', 'wishes-section'];
  const navItems = document.querySelectorAll('.nav-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => {
          const box = item.querySelector('.icon-box');
          if (item.getAttribute('href') === `#${entry.target.id}`) {
            box?.classList.add('bg-purpleTheme-900', 'text-butter-300', 'scale-110');
            box?.classList.remove('bg-butter-200/90', 'text-purpleTheme-900');
          } else {
            box?.classList.remove('bg-purpleTheme-900', 'text-butter-300', 'scale-110');
            box?.classList.add('bg-butter-200/90', 'text-purpleTheme-900');
          }
        });
      }
    });
  }, { threshold: 0.2 });
  sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });

});