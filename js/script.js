document.addEventListener('DOMContentLoaded', () => {
	
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP5CFIHTFg9lJNzupWptbtYGECjOwOCIsqei6IpcUBcySKPuL0wZyeiRM1tbo76t2R/exec';
  
  function fetchSiteConfig() {
    if (!SCRIPT_URL.includes('http')) return;

    fetch(`${SCRIPT_URL}?action=config`)
      .then(res => res.json())
      .then(config => {
        if (!config) return;

        if (config.bride_fullname && document.getElementById('dyn-bride-fullname')) {
          document.getElementById('dyn-bride-fullname').innerText = config.bride_fullname;
        }
        if (config.bride_desc && document.getElementById('dyn-bride-desc')) {
          document.getElementById('dyn-bride-desc').innerText = config.bride_desc;
        }
        if (config.groom_fullname && document.getElementById('dyn-groom-fullname')) {
          document.getElementById('dyn-groom-fullname').innerText = config.groom_fullname;
        }
        if (config.groom_desc && document.getElementById('dyn-groom-desc')) {
          document.getElementById('dyn-groom-desc').innerText = config.groom_desc;
        }

        if (config.event_date && document.getElementById('dyn-event-date')) {
          document.getElementById('dyn-event-date').innerHTML = `<i class="far fa-calendar-alt text-purpleTheme-700 mr-2"></i> ${config.event_date}`;
        }
        if (config.event_time && document.getElementById('dyn-event-time')) {
          document.getElementById('dyn-event-time').innerHTML = `<i class="far fa-clock text-purpleTheme-700 mr-2"></i> ${config.event_time}`;
        }
        if (config.event_location && document.getElementById('dyn-event-location')) {
          document.getElementById('dyn-event-location').innerHTML = `<i class="fas fa-map-marker-alt text-purpleTheme-700 mr-2"></i> ${config.event_location}`;
        }

        if (config.gmaps_url && document.getElementById('dyn-gmaps-link')) {
          document.getElementById('dyn-gmaps-link').href = config.gmaps_url;
        }
        if (config.waze_url && document.getElementById('dyn-waze-link')) {
          document.getElementById('dyn-waze-link').href = config.waze_url;
        }

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
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} Orang`;
            paxSelect.appendChild(option);
          }
        }

        const rsvpFormEl = document.getElementById('rsvp-form');
        const rsvpNameInput = document.getElementById('rsvp-name');
        const rsvpPhoneInput = document.getElementById('rsvp-phone');
        const rsvpStatusInput = document.getElementById('rsvp-status');
        const rsvpSubmitBtn = rsvpFormEl ? rsvpFormEl.querySelector('button[type="submit"]') : null;

        if (config.control_RSVP !== undefined) {
          const valR = String(config.control_RSVP).trim().toUpperCase();
          if (valR === 'FALSE' || valR === 'OFF' || valR === '0' || valR === '') {
            if (rsvpSubmitBtn) {
              rsvpSubmitBtn.disabled = true;
              rsvpSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              rsvpSubmitBtn.classList.remove('hover:bg-purpleTheme-800', 'bg-purpleTheme-700');
              rsvpSubmitBtn.innerText = "RSVP DITUTUP";
            }
            if (rsvpNameInput) rsvpNameInput.disabled = true;
            if (rsvpPhoneInput) rsvpPhoneInput.disabled = true;
            if (rsvpStatusInput) rsvpStatusInput.disabled = true;
            if (paxSelect) paxSelect.disabled = true;
          } else {
            if (rsvpSubmitBtn) {
              rsvpSubmitBtn.disabled = false;
              rsvpSubmitBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              rsvpSubmitBtn.classList.add('hover:bg-purpleTheme-800', 'bg-purpleTheme-700');
              rsvpSubmitBtn.innerText = "Hantar Pengesahan";
            }
            if (rsvpNameInput) rsvpNameInput.disabled = false;
            if (rsvpPhoneInput) rsvpPhoneInput.disabled = false;
            if (rsvpStatusInput) rsvpStatusInput.disabled = false;
            if (paxSelect) paxSelect.disabled = false;
          }
        }

        const uploadBtn = document.getElementById('btn-upload-gallery');
        if (uploadBtn && config.control_gallery !== undefined) {
          const valG = String(config.control_gallery).trim().toUpperCase();
          const photoInput = document.getElementById('photo-upload');
          
          if (valG === 'FALSE' || valG === 'OFF' || valG === '0' || valG === '') {
            uploadBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
            uploadBtn.classList.remove('bg-butter-200', 'hover:bg-butter-300', 'text-purpleTheme-900', 'border-butter-300');
            uploadBtn.innerHTML = `<i class="fas fa-lock text-base"></i> Muat Naik Ditutup`;
            if (photoInput) photoInput.disabled = true;
          } else {
            uploadBtn.classList.remove('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
            uploadBtn.classList.add('bg-butter-200', 'hover:bg-butter-300', 'text-purpleTheme-900', 'border-butter-300');
            uploadBtn.innerHTML = `<i class="fas fa-cloud-upload-alt text-base"></i> Muat Naik Gambar <input type="file" id="photo-upload" accept="image/*" class="hidden">`;
            bindPhotoUploadListener();
          }
        }

        const wishSubmitBtn = document.getElementById('btn-submit-wish');
        const wishNameInput = document.getElementById('wish-name');
        const wishMsgInput = document.getElementById('wish-message');

        if (config.control_wish !== undefined) {
          const valW = String(config.control_wish).trim().toUpperCase();

          if (valW === 'FALSE' || valW === 'OFF' || valW === '0' || valW === '') {
            if (wishSubmitBtn) {
              wishSubmitBtn.disabled = true;
              wishSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              wishSubmitBtn.classList.remove('hover:bg-purpleTheme-800', 'bg-purpleTheme-900');
              wishSubmitBtn.innerText = "UCAPAN DITUTUP";
            }
            if (wishNameInput) wishNameInput.disabled = true;
            if (wishMsgInput) wishMsgInput.disabled = true;
          } else {
            if (wishSubmitBtn) {
              wishSubmitBtn.disabled = false;
              wishSubmitBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              wishSubmitBtn.classList.add('hover:bg-purpleTheme-800', 'bg-purpleTheme-900');
              wishSubmitBtn.innerText = "HANTAR UCAPAN";
            }
            if (wishNameInput) wishNameInput.disabled = false;
            if (wishMsgInput) wishMsgInput.disabled = false;
          }
        }
      })
      .catch(err => console.log("Gagal memuatkan konfigurasi dari sheet:", err));
  }
  
  fetchSiteConfig();
  
  function fetchTentative() {
    if (!SCRIPT_URL.includes('http')) return;

    fetch(`${SCRIPT_URL}?action=tentative`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('dyn-tentative-container');
        const scrollBox = document.getElementById('tentative-scroll-box');
        const scrollIndicator = document.getElementById('tentative-scroll-indicator');

        if (!container) return;

        if (data && data.length > 0) {
          container.innerHTML = data.map(item => {
            let displayTime = item.time;
            if (displayTime.includes('GMT') || displayTime.includes('1899')) {
              const dateObj = new Date(displayTime);
              if (!isNaN(dateObj.getTime())) {
                displayTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              }
            }

            return `
			  <div class="relative">
				<span class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-purpleTheme-700 border-2 border-white"></span>
				<span class="text-xs font-semibold text-purpleTheme-700 bg-butter-100 px-2 py-0.5 rounded">${displayTime}</span>
				<p class="text-sm font-medium text-purpleTheme-900 mt-1">${item.description}</p>
			  </div>
			`;
          }).join('');

          if (scrollBox && scrollIndicator) {
            if (scrollBox.scrollHeight <= scrollBox.clientHeight) {
              scrollIndicator.classList.add('hidden');
            } else {
              scrollIndicator.classList.remove('hidden');
            }

            scrollBox.addEventListener('scroll', () => {
              if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 10) {
                scrollIndicator.style.opacity = '0';
              } else {
                scrollIndicator.style.opacity = '1';
              }
            });
          }
        } else {
          container.innerHTML = `<p class="text-xs text-purpleTheme-700/60 italic">Akan dikemaskini.</p>`;
          if (scrollIndicator) scrollIndicator.classList.add('hidden');
        }
      })
      .catch(err => console.log("Gagal memuatkan atur cara majlis:", err));
  }

  fetchTentative();

  const rsvpStatus = document.getElementById('rsvp-status');
  const paxContainer = document.getElementById('pax-container');
  const rsvpPax = document.getElementById('rsvp-pax');

  if (rsvpStatus && paxContainer) {
    rsvpStatus.addEventListener('change', () => {
      if (rsvpStatus.value === 'Hadir') {
        paxContainer.classList.remove('hidden');
        if (rsvpPax) rsvpPax.value = "1";
      } else {
        paxContainer.classList.add('hidden');
        if (rsvpPax) rsvpPax.value = "0"; 
      }
    });
  }
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#hero-section') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const musicLabel = document.getElementById('music-label');
  const heroOpenBtn = document.getElementById('hero-open-btn');
  
  let isPlaying = false;
  let hasInteracted = false;

  function updateMusicUI() {
    if (isPlaying) {
      if (musicIcon) musicIcon.className = 'fas fa-volume-high fa-beat text-purpleTheme-700';
      if (musicLabel) musicLabel.innerText = "Muzik: ON";
    } else {
      if (musicIcon) musicIcon.className = 'fas fa-volume-xmark text-purpleTheme-700/60';
      if (musicLabel) musicLabel.innerText = "Muzik: OFF";
    }
  }

  function playAudioTrack() {
    if (bgMusic) {
      bgMusic.play().then(() => {
        isPlaying = true;
        hasInteracted = true;
        updateMusicUI();
      }).catch((error) => {
        console.log("Autoplay disekat oleh pelayar:", error);
      });
    }
  }

  if (heroOpenBtn) {
    heroOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isPlaying) playAudioTrack();
      const target = document.querySelector('#invitation-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function triggerAudioOnFirstInteraction() {
    if (!hasInteracted && bgMusic) {
      playAudioTrack();
      window.removeEventListener('click', triggerAudioOnFirstInteraction);
      window.removeEventListener('scroll', triggerAudioOnFirstInteraction);
      window.removeEventListener('touchstart', triggerAudioOnFirstInteraction);
    }
  }

  window.addEventListener('click', triggerAudioOnFirstInteraction);
  window.addEventListener('scroll', triggerAudioOnFirstInteraction);
  window.addEventListener('touchstart', triggerAudioOnFirstInteraction);
  
  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        updateMusicUI(); // Kemas kini terus apabila dipause
      } else {
        bgMusic.play().then(() => { 
          isPlaying = true; 
          updateMusicUI();
        }).catch((err) => { 
          console.log("Audio play error:", err); 
        });
      }
      hasInteracted = true;
    });
  }

  const weddingDate = new Date('May 22, 2027 10:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl) return;

    if (distance < 0) {
      daysEl.innerText = "00"; hoursEl.innerText = "00"; minutesEl.innerText = "00"; secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = days < 10 ? '0' + days : days;
    hoursEl.innerText = hours < 10 ? '0' + hours : hours;
    minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  const calBtn = document.getElementById('add-calendar-btn');
  if (calBtn) {
    calBtn.addEventListener('click', () => {
      const icsData = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Digital Wedding Invitation//EN
BEGIN:VEVENT
SUMMARY:Majlis Nikah Utrias & Hazim
DESCRIPTION:Undangan Majlis Akad Nikah Utrias & Hazim
LOCATION:Jl. Lalang Buaya Remojing Binangun, Kemojing, Binangun, Cilacap Regency, Central Java 53281, Indonesia
DTSTART:20270522T030000Z
DTEND:20270522T070000Z
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Majlis_Nikah_Utrias_Hazim.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
  
  /* -------------------------------------------------------------
     CUSTOM MODAL PENGESAHAN (ROBUST & SAFE)
  ------------------------------------------------------------- */
  const confirmModal = document.getElementById('custom-confirm-modal');
  const confirmTitle = document.getElementById('custom-modal-title');
  const confirmDesc = document.getElementById('custom-modal-desc');
  const dialogYesBtn = document.getElementById('modal-btn-yes');
  const dialogCancelBtn = document.getElementById('modal-btn-no');

  let currentConfirmCallback = null;

  if (dialogYesBtn) {
    dialogYesBtn.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      if (typeof currentConfirmCallback === 'function') {
        currentConfirmCallback();
        currentConfirmCallback = null;
      }
    });
  }

  if (dialogCancelBtn) {
    dialogCancelBtn.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      currentConfirmCallback = null;
    });
  }

  function showConfirmDialog(title, desc, onConfirm) {
    if (!confirmModal) {
      onConfirm();
      return;
    }

    if (confirmTitle) confirmTitle.innerText = title;
    if (confirmDesc) confirmDesc.innerText = desc;
    currentConfirmCallback = onConfirm;
    confirmModal.classList.remove('hidden');
  }

  /* -------------------------------------------------------------
     1. RSVP SUBMISSION
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      showConfirmDialog(
        "Hantar Pengesahan RSVP?",
        "Adakah anda pasti maklumat kehadiran yang dimasukkan sudah betul?",
        () => {
          const submitBtn = rsvpForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn ? submitBtn.innerText : "Hantar";
          if (submitBtn) {
            submitBtn.innerText = "Sedang Hantar...";
            submitBtn.disabled = true;
          }

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
                if (paxContainer) paxContainer.classList.remove('hidden');
                if (rsvpPax) rsvpPax.value = "1";
                setTimeout(() => { alertBox.classList.add('hidden'); }, 5000);
              }
            }
            if (submitBtn) {
              submitBtn.innerText = originalBtnText;
              submitBtn.disabled = false;
            }
          })
          .catch(error => {
            console.error('RSVP Error:', error);
            if (submitBtn) {
              submitBtn.innerText = originalBtnText;
              submitBtn.disabled = false;
            }
          });
        }
      );
    });
  }

  /* -------------------------------------------------------------
     2. GALLERY, SLIDESHOW & UPLOAD
  ------------------------------------------------------------- */
  const fallbackGallery = [
    { url: "https://sites.create-cdn.net/siteimages/73/5/5/735562/21/1/9/21197176/1000x1000.jpg?1726336942", caption: "Detik Manis Bersama Bermula Disini..." }
  ];

  let defaultGallery = [];
  let currentSlide = 0;
  let slideTimer = null;
  let isUsingFallback = false;
  let selectedFileForUpload = null;
  
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');
  const slideContainer = document.getElementById('slideshow-container');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  const uploadModal = document.getElementById('upload-modal');
  const closeUploadModalBtn = document.getElementById('close-upload-modal');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const confirmUploadBtn = document.getElementById('confirm-upload-btn');
  const uploaderNameInput = document.getElementById('modal-uploader-name');
  const imageCaptionInput = document.getElementById('modal-image-caption');

  function bindPhotoUploadListener() {
    const photoUpload = document.getElementById('photo-upload');
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
  }

  function fetchGalleryImages(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;
    
    fetch(`${SCRIPT_URL}?action=gallery`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const newGallery = data.map(item => ({
            url: item.url,
            caption: `${item.caption} (Oleh: ${item.name})`
          }));

          if (JSON.stringify(newGallery) !== JSON.stringify(defaultGallery)) {
            defaultGallery = newGallery;
            isUsingFallback = false;
            if (!isBackgroundCheck) {
              currentSlide = 0;
              renderSlide();
            }
          }
        } else {
          if (!isUsingFallback) {
            defaultGallery = [...fallbackGallery];
            isUsingFallback = true;
            currentSlide = 0;
            renderSlide();
          }
        }
      })
      .catch(err => console.log("Gagal memuat galeri:", err));
  }

  function renderSlide() {
    if (!slideImg || !slideCaption || defaultGallery.length === 0) return;
    if (slideTimer) clearTimeout(slideTimer);
    if (currentSlide >= defaultGallery.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = defaultGallery.length - 1;

    const currentImageUrl = defaultGallery[currentSlide].url;
    const currentText = defaultGallery[currentSlide].caption;

    slideImg.style.opacity = '0.3';
    setTimeout(() => {
      slideImg.src = currentImageUrl;
      slideCaption.innerText = currentText;
      slideImg.style.opacity = '1';
    }, 200);

    slideTimer = setTimeout(() => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide();
    }, 10000);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + defaultGallery.length) % defaultGallery.length;
      renderSlide(); 
    });
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide(); 
    });
  }

  function closeUploadModal() {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFileForUpload = null;
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) photoUpload.value = '';
  }

  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);

  bindPhotoUploadListener();

  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', () => {
      if (!selectedFileForUpload) return;
      
      if (uploadModal) uploadModal.classList.add('hidden');

      showConfirmDialog(
        "Muat Naik Gambar?",
        "Adakah anda pasti mahu memuat naik gambar ini ke galeri majlis?",
        () => {
          const uploaderName = uploaderNameInput.value.trim() || "Tetamu Undangan";
          const imageCaption = imageCaptionInput.value.trim() || "Kenangan Majlis";
          const galleryAlert = document.getElementById('gallery-alert');

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

              const originalDataUrl = canvas.toDataURL('image/jpeg', 1.0);
              const base64String = originalDataUrl.split(',')[1];

              const formData = new URLSearchParams();
              formData.append('action', 'gallery');
              formData.append('fileName', selectedFileForUpload.name.replace(/\.[^/.]+$/, "") + ".jpg");
              formData.append('mimeType', 'image/jpeg');
              formData.append('fileData', base64String);
              formData.append('name', uploaderName);
              formData.append('caption', imageCaption);
              
              fetch(SCRIPT_URL, { 
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

  fetchGalleryImages();
  setInterval(() => { fetchGalleryImages(true); }, 10000);

  /* -------------------------------------------------------------
     3. WISHES (BUKU HAJAT) SUBMISSION
  ------------------------------------------------------------- */
  let defaultWishes = [
    { name: "Systems", message: "Titipkan sepotong doa, pesanan, atau hajat buat pengantin.", timestamp: new Date().toISOString() }
  ];

  let isUsingWishFallback = false;

  function getRelativeTime(timestamp) {
    if (!timestamp) return "Baru sahaja";
    let date = typeof timestamp === 'string' ? new Date(timestamp.replace(/-/g, "/")) : new Date(timestamp);
    if (isNaN(date.getTime())) return "Baru sahaja";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 5) return "Baru sahaja";
    if (diffInSeconds < 60) return `${diffInSeconds} saat lalu`;
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes} minit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;

    return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderWishes() {
    const container = document.getElementById('wishes-container');
    if (!container) return;
    container.innerHTML = defaultWishes.map(w => `
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purpleTheme-100 shadow-sm space-y-1.5 transition-all">
        <div class="flex items-center justify-between border-b border-purpleTheme-50 pb-1.5">
          <h4 class="font-serif font-semibold text-purpleTheme-900 text-sm sm:text-base">${w.name}</h4>
          <span class="text-[10px] text-purpleTheme-700/60 font-light wish-time" data-timestamp="${w.timestamp || ''}">${getRelativeTime(w.timestamp)}</span>
        </div>
        <p class="text-xs sm:text-sm text-purpleTheme-800/90 leading-relaxed font-light whitespace-pre-line break-words">${w.message}</p>
      </div>
    `).join('');
  }

  function updateLiveTimestamps() {
    document.querySelectorAll('.wish-time').forEach(el => {
      const timestamp = el.getAttribute('data-timestamp');
      if (timestamp) el.innerText = getRelativeTime(timestamp);
    });
  }

  function fetchWishes(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;
    fetch(`${SCRIPT_URL}?action=wishes`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const newWishes = data.map(item => ({ name: item.name, message: item.message, timestamp: item.timestamp })).reverse();
          const oldWishesSimple = defaultWishes.map(w => ({ name: w.name, message: w.message }));
          const newWishesSimple = newWishes.map(w => ({ name: w.name, message: w.message }));

          if (JSON.stringify(newWishesSimple) !== JSON.stringify(oldWishesSimple)) {
            defaultWishes = newWishes;
            isUsingWishFallback = false;
            renderWishes();
          }
        } else {
          if (!isUsingWishFallback && !isBackgroundCheck) {
            isUsingWishFallback = true;
            renderWishes();
          }
        }
      })
      .catch(err => console.log("Gagal memuat ucapan:", err));
  }

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
            const originalBtnText = submitBtn ? submitBtn.innerText : "HANTAR UCAPAN";
            if (submitBtn) { 
              submitBtn.innerText = "Sedang Hantar..."; 
              submitBtn.disabled = true; 
            }

            const formData = new URLSearchParams();
            formData.append('action', 'wishes');
            formData.append('name', nameInput.value);
            formData.append('message', msgInput.value);
            
            fetch(SCRIPT_URL, { 
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
              if (submitBtn) { 
                submitBtn.innerText = originalBtnText; 
                submitBtn.disabled = false; 
              }
            })
            .catch(error => {
              console.error('Wish Error:', error);
              if (submitBtn) { 
                submitBtn.innerText = originalBtnText; 
                submitBtn.disabled = false; 
              }
            });
          }
        );
      }
    });
  }

  fetchWishes();
  setInterval(() => { fetchWishes(true); }, 5000);
  setInterval(() => { updateLiveTimestamps(); }, 30000);

  if (slideContainer) {
    const modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center hidden p-4 cursor-pointer';
    modal.innerHTML = `
      <div class="relative max-w-5xl max-h-full flex flex-col items-center">
        <span class="absolute -top-10 right-0 text-white text-3xl font-bold cursor-pointer">&times;</span>
        <img id="modal-img" class="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" src="" alt="Preview">
        <p id="modal-caption" class="text-white text-sm mt-3 italic text-center"></p>
      </div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    slideContainer.addEventListener('click', (e) => {
      if (e.target.closest('#prev-slide') || e.target.closest('#next-slide')) return;
      if (slideImg && slideImg.src) {
        let rawUrl = slideImg.src;
        if (rawUrl.includes('googleusercontent.com')) rawUrl = rawUrl.split('=')[0] + '=s0';
        modalImg.src = rawUrl;
        modalCaption.innerText = slideCaption ? slideCaption.innerText : '';
        modal.classList.remove('hidden');
      }
    });

    modal.addEventListener('click', () => { modal.classList.add('hidden'); });
  }
  
  const quickActionBar = document.getElementById('quick-action-bar');
  const musicContainer = document.getElementById('music-container');

  if (quickActionBar) {
    let idleTimer = null;
    const isMobileDevice = () => window.innerWidth < 768;

    function showElements() {
      if (window.scrollY > 300) {
        quickActionBar.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        quickActionBar.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        if (musicContainer) {
          musicContainer.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
          musicContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
      }
    }

    function hideElements() {
      if (isMobileDevice() && window.scrollY > 300) {
        quickActionBar.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        quickActionBar.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        if (musicContainer) {
          musicContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
          musicContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
      }
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        showElements();
        if (isMobileDevice()) {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(hideElements, 3000);
        }
      } else {
        quickActionBar.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        quickActionBar.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        if (musicContainer) {
          musicContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
          musicContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
      }
    });

    window.addEventListener('touchstart', () => {
      if (isMobileDevice() && window.scrollY > 300) {
        showElements();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(hideElements, 3000);
      }
    });

    const sectionIds = ['invitation-section', 'details-section', 'rsvp-section', 'gallery-section', 'wishes-section'];
    const navItems = document.querySelectorAll('.nav-item');

    function setActiveNav(activeId) {
      navItems.forEach(item => {
        const iconBox = item.querySelector('.icon-box');
        const navLabel = item.querySelector('.nav-label');
        if (item.id === `nav-${activeId}`) {
          iconBox.classList.remove('bg-butter-200/90', 'text-purpleTheme-900');
          iconBox.classList.add('bg-purpleTheme-900', 'text-butter-300', 'scale-110');
          if (navLabel) {
            navLabel.classList.remove('text-purpleTheme-800');
            navLabel.classList.add('text-purpleTheme-900', 'font-bold');
          }
        } else {
          iconBox.classList.remove('bg-purpleTheme-900', 'text-butter-300', 'scale-110');
          iconBox.classList.add('bg-butter-200/90', 'text-purpleTheme-900');
          if (navLabel) {
            navLabel.classList.remove('text-purpleTheme-900', 'font-bold');
            navLabel.classList.add('text-purpleTheme-800');
          }
        }
      });
    }

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetSectionId = item.getAttribute('href').substring(1);
        setActiveNav(targetSectionId);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    }, { root: null, rootMargin: '-20% 0px -20% 0px', threshold: 0.1 });

    sectionIds.forEach(id => {
      const sectionEl = document.getElementById(id);
      if (sectionEl) observer.observe(sectionEl);
    });
  }
});