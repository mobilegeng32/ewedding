document.addEventListener('DOMContentLoaded', () => {
  
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP5CFIHTFg9lJNzupWptbtYGECjOwOCIsqei6IpcUBcySKPuL0wZyeiRM1tbo76t2R/exec';
  
  /* -------------------------------------------------------------
     1. SISTEM CONFIG & DINAMIK DATA (TERMASUK URL PARAMETER NAMA)
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

        // Paparan Teks Pengantin & Lokasi
        if (config.bride_fullname && document.getElementById('dyn-bride-fullname')) document.getElementById('dyn-bride-fullname').innerText = config.bride_fullname;
        if (config.bride_desc && document.getElementById('dyn-bride-desc')) document.getElementById('dyn-bride-desc').innerText = config.bride_desc;
        if (config.groom_fullname && document.getElementById('dyn-groom-fullname')) document.getElementById('dyn-groom-fullname').innerText = config.groom_fullname;
        if (config.groom_desc && document.getElementById('dyn-groom-desc')) document.getElementById('dyn-groom-desc').innerText = config.groom_desc;

        if (config.event_date && document.getElementById('dyn-event-date')) document.getElementById('dyn-event-date').innerHTML = `<i class="far fa-calendar-alt text-purpleTheme-700 mr-2"></i> ${config.event_date}`;
        if (config.event_time && document.getElementById('dyn-event-time')) document.getElementById('dyn-event-time').innerHTML = `<i class="far fa-clock text-purpleTheme-700 mr-2"></i> ${config.event_time}`;
        if (config.event_location && document.getElementById('dyn-event-location')) document.getElementById('dyn-event-location').innerHTML = `<i class="fas fa-map-marker-alt text-purpleTheme-700 mr-2"></i> ${config.event_location}`;

        if (config.gmaps_url && document.getElementById('dyn-gmaps-link')) document.getElementById('dyn-gmaps-link').href = config.gmaps_url;
        if (config.waze_url && document.getElementById('dyn-waze-link')) document.getElementById('dyn-waze-link').href = config.waze_url;

        // Info Hubungi
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

        // Dropdown Pax RSVP
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

        // Kawalan Suis (Kill-Switch dari Config Sheet)
        applyFeatureToggles(config);
      })
      .catch(err => console.log("Gagal memuatkan config:", err));
  }

  function applyFeatureToggles(config) {
    // 1. RSVP Toggle
    const rsvpBtn = document.querySelector('#rsvp-form button[type="submit"]');
    if (config.control_RSVP !== undefined && rsvpBtn) {
      if (String(config.control_RSVP).toUpperCase() === 'FALSE') {
        rsvpBtn.disabled = true;
        rsvpBtn.className = "w-full bg-gray-400 text-white font-medium py-3.5 rounded-xl text-sm opacity-50 cursor-not-allowed";
        rsvpBtn.innerText = "RSVP DITUTUP";
      }
    }
    // 2. Gallery Toggle
    const uploadBtn = document.getElementById('btn-upload-gallery');
    if (config.control_gallery !== undefined && uploadBtn) {
      if (String(config.control_gallery).toUpperCase() === 'FALSE') {
        uploadBtn.className = "cursor-not-allowed bg-gray-300 text-gray-600 font-medium px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 opacity-50 pointer-events-none";
        uploadBtn.innerHTML = `<i class="fas fa-lock"></i> Muat Naik Ditutup`;
      }
    }
    // 3. Wishes Toggle
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
     2. PENGURUSAN CUSTOM MODAL PENGESAHAN (BERASINGAN)
  ------------------------------------------------------------- */
  const customModal = document.getElementById('custom-confirm-modal');
  const modalTitle = document.getElementById('custom-modal-title');
  const modalDesc = document.getElementById('custom-modal-desc');
  const modalBtnYes = document.getElementById('modal-btn-yes');
  const modalBtnNo = document.getElementById('modal-btn-no');
  const modalIconClass = document.getElementById('modal-icon-class');

  function openCustomModal(title, desc, iconClass, onYesCallback) {
    if (!customModal) {
      if (confirm(desc)) onYesCallback();
      return;
    }
    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalIconClass.className = iconClass || "fas fa-question-circle";
    customModal.classList.remove('hidden');

    // Buang event listener lama dengan clone node untuk elak pertindihan
    const newYes = modalBtnYes.cloneNode(true);
    const newNo = modalBtnNo.cloneNode(true);
    modalBtnYes.parentNode.replaceChild(newYes, modalBtnYes);
    modalBtnNo.parentNode.replaceChild(newNo, modalBtnNo);

    newYes.addEventListener('click', () => {
      customModal.classList.add('hidden');
      onYesCallback();
    });

    newNo.addEventListener('click', () => {
      customModal.classList.add('hidden');
    });
  }


  /* -------------------------------------------------------------
     3. FUNGSI UTAMA 1: RSVP SUBMISSION & MODAL
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      openCustomModal(
        "Sahkan Kehadiran (RSVP)?",
        "Adakah anda pasti maklumat kehadiran dan bilangan tetamu yang dimasukkan sudah tepat?",
        "fas fa-clipboard-check",
        () => {
          const submitBtn = rsvpForm.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerText;
          submitBtn.innerText = "Sedang Hantar...";
          submitBtn.disabled = true;

          const formData = new URLSearchParams();
          formData.append('action', 'rsvp');
          formData.append('name', document.getElementById('rsvp-name').value);
          formData.append('phone', document.getElementById('rsvp-phone').value);
          formData.append('status', document.getElementById('rsvp-status').value);
          formData.append('pax', document.getElementById('rsvp-pax').value);

          fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
          })
          .then(res => res.json())
          .then(data => {
            const alertBox = document.getElementById('rsvp-alert');
            if (data.status === "error") {
              alertBox.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 mr-2"></i> ${data.message}`;
            } else {
              alertBox.innerHTML = `<i class="fas fa-check-circle text-purpleTheme-700 mr-2"></i> Terima kasih! RSVP anda berjaya direkodkan.`;
              rsvpForm.reset();
            }
            alertBox.classList.remove('hidden');
            setTimeout(() => alertBox.classList.add('hidden'), 5000);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          })
          .catch(err => {
            console.error("RSVP Error:", err);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          });
        }
      );
    });
  }

  // Toggle Pax dropdown mengikut status hadir
  const rsvpStatus = document.getElementById('rsvp-status');
  const paxContainer = document.getElementById('pax-container');
  if (rsvpStatus && paxContainer) {
    rsvpStatus.addEventListener('change', () => {
      if (rsvpStatus.value === 'Hadir') {
        paxContainer.classList.remove('hidden');
      } else {
        paxContainer.classList.add('hidden');
      }
    });
  }


  /* -------------------------------------------------------------
     4. FUNGSI UTAMA 2: GALLERY UPLOAD & MODAL
  ------------------------------------------------------------- */
  let selectedFileForUpload = null;
  const photoUploadInput = document.getElementById('photo-upload');
  const uploadModal = document.getElementById('upload-modal');
  const confirmUploadBtn = document.getElementById('confirm-upload-btn');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const closeUploadModalBtn = document.getElementById('close-upload-modal');

  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFileForUpload = file;
        document.getElementById('modal-uploader-name').value = '';
        document.getElementById('modal-image-caption').value = '';
        uploadModal.classList.remove('hidden');
      }
    });
  }

  function closeUploadModalFunc() {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFileForUpload = null;
    if (photoUploadInput) photoUploadInput.value = '';
  }

  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModalFunc);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModalFunc);

  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', () => {
      if (!selectedFileForUpload) return;

      // Custom modal untuk pengesahan akhir upload gambar
      openCustomModal(
        "Muat Naik Gambar?",
        "Adakah anda pasti mahu berkongsi kenangan gambar ini ke galeri majlis?",
        "fas fa-camera",
        () => {
          uploadModal.classList.add('hidden');
          const galleryAlert = document.getElementById('gallery-alert');
          galleryAlert.innerHTML = `<i class="fas fa-spinner fa-spin text-purpleTheme-700 mr-2"></i> Sedang memproses & memuat naik...`;
          galleryAlert.classList.remove('hidden');

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
              formData.append('name', document.getElementById('modal-uploader-name').value.trim() || "Tetamu");
              formData.append('caption', document.getElementById('modal-image-caption').value.trim() || "Kenangan Majlis");

              fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
              })
              .then(res => res.json())
              .then(data => {
                if (data.status === "error") {
                  galleryAlert.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 mr-2"></i> ${data.message}`;
                } else {
                  galleryAlert.innerHTML = `<i class="fas fa-check-circle text-purpleTheme-700 mr-2"></i> Berjaya! Terima kasih sudi berkongsi kenangan.`;
                  fetchGalleryImages();
                }
                setTimeout(() => galleryAlert.classList.add('hidden'), 5000);
                closeUploadModalFunc();
              })
              .catch(err => {
                console.error("Gallery Error:", err);
                galleryAlert.classList.add('hidden');
                closeUploadModalFunc();
              });
            };
          };
          reader.readAsDataURL(selectedFileForUpload);
        }
      );
    });
  }

  // Fetch Galeri Slideshow
  let defaultGallery = [{ url: "https://sites.create-cdn.net/siteimages/73/5/5/735562/21/1/9/21197176/1000x1000.jpg?1726336942", caption: "Detik Manis Bersama" }];
  let currentSlide = 0;
  let slideTimer = null;

  function fetchGalleryImages(isBackground = false) {
    if (!SCRIPT_URL.includes('http')) return;
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          defaultGallery = data.map(item => ({ url: item.url, caption: `${item.caption} (Oleh: ${item.name})` }));
          if (!isBackground) { currentSlide = 0; renderSlide(); }
        }
      })
      .catch(err => console.log("Gagal memuat galeri:", err));
  }

  function renderSlide() {
    const imgEl = document.getElementById('slideshow-img');
    const capEl = document.getElementById('slideshow-caption');
    if (!imgEl || defaultGallery.length === 0) return;
    if (slideTimer) clearTimeout(slideTimer);
    if (currentSlide >= defaultGallery.length) currentSlide = 0;

    imgEl.src = defaultGallery[currentSlide].url;
    capEl.innerText = defaultGallery[currentSlide].caption;

    slideTimer = setTimeout(() => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide();
    }, 8000);
  }
  fetchGalleryImages();
  setInterval(() => fetchGalleryImages(true), 15000);


  /* -------------------------------------------------------------
     5. FUNGSI UTAMA 3: WISHES (BUKU HAJAT) & MODAL
  ------------------------------------------------------------- */
  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name');
      const msgInput = document.getElementById('wish-message');

      if (nameInput.value && msgInput.value) {
        openCustomModal(
          "Hantar Ucapan & Doa?",
          "Adakah anda pasti mahu menghantar ucapan dan doa restu ini kepada pengantin?",
          "fas fa-heart",
          () => {
            const submitBtn = wishForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Sedang Hantar...";
            submitBtn.disabled = true;

            const formData = new URLSearchParams();
            formData.append('action', 'wishes');
            formData.append('name', nameInput.value);
            formData.append('message', msgInput.value);

            fetch(SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formData
            })
            .then(res => res.json())
            .then(data => {
              const alertBox = document.getElementById('wish-alert');
              if (data.status === "error") {
                alertBox.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 mr-2"></i> ${data.message}`;
              } else {
                alertBox.innerHTML = `Terima kasih! Ucapan anda berjaya direkodkan. 🤍`;
                wishForm.reset();
                fetchWishes();
              }
              alertBox.classList.remove('hidden');
              setTimeout(() => alertBox.classList.add('hidden'), 5000);
              submitBtn.innerText = originalText;
              submitBtn.disabled = false;
            })
            .catch(err => {
              console.error("Wish Error:", err);
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
     6. LAIN-LAIN: AUDIO, TENTATIVE, COUNTDOWN & FLOATING BAR
  ------------------------------------------------------------- */
  // Atur Cara Majlis (Tentative)
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

  // Muzik & Interaksi
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

  // Countdown
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

  // Floating Action Bar & Intersection Observer
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