document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
     0. CONFIGURATION: URL Google Apps Script Anda
  ------------------------------------------------------------- */
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP5CFIHTFg9lJNzupWptbtYGECjOwOCIsqei6IpcUBcySKPuL0wZyeiRM1tbo76t2R/exec';


  /* -------------------------------------------------------------
     1. Smooth Scroll Handler
  ------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });


  /* -------------------------------------------------------------
     2. Background Music Controller & Auto-play on First Interaction
  ------------------------------------------------------------- */
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  let isPlaying = false;
  let hasInteracted = false;

  function triggerAudioPlay() {
    if (!hasInteracted && bgMusic) {
      bgMusic.play().then(() => {
        if (musicIcon) musicIcon.className = 'fas fa-pause text-lg';
        isPlaying = true;
        hasInteracted = true;
        window.removeEventListener('click', triggerAudioPlay);
        window.removeEventListener('scroll', triggerAudioPlay);
        window.removeEventListener('touchstart', triggerAudioPlay);
      }).catch((error) => {
        console.log("Autoplay disekat oleh pelayar:", error);
      });
    }
  }

  window.addEventListener('click', triggerAudioPlay);
  window.addEventListener('scroll', triggerAudioPlay);
  window.addEventListener('touchstart', triggerAudioPlay);

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        bgMusic.pause();
        if (musicIcon) musicIcon.className = 'fas fa-music text-lg';
      } else {
        bgMusic.play().then(() => {
          if (musicIcon) musicIcon.className = 'fas fa-pause text-lg';
        }).catch((err) => {
          console.log("Audio play error:", err);
        });
      }
      isPlaying = !isPlaying;
      hasInteracted = true;
    });
  }


  /* -------------------------------------------------------------
     3. Live Countdown Timer
  ------------------------------------------------------------- */
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
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
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


  /* -------------------------------------------------------------
     4. Add to Calendar ICS Generator
  ------------------------------------------------------------- */
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
     5. RSVP Submission Logic (Google Sheets via URLSearchParams)
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
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

      fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        const alertBox = document.getElementById('rsvp-alert');
        if (alertBox) {
          alertBox.classList.remove('hidden');
          rsvpForm.reset();
          setTimeout(() => {
            alertBox.classList.add('hidden');
          }, 5000);
        }
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
      })
      .catch(error => {
        console.error('RSVP Error:', error);
        alert('Terdapat masalah semasa menghantar RSVP. Sila cuba lagi.');
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
      });
    });
  }


  /* -------------------------------------------------------------
     6. Dynamic Gallery & Google Drive/Sheets Integration (Original Size Full Resolution)
  ------------------------------------------------------------- */
  const fallbackGallery = [
    {
      url: "https://sites.create-cdn.net/siteimages/73/5/5/735562/21/1/9/21197176/1000x1000.jpg?1726336942",
      caption: "Detik Manis Bersama"
    }
  ];

  let defaultGallery = [];
  let currentSlide = 0;
  let slideTimer = null;
  let isUsingFallback = false;
  
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');
  const slideshowContainer = document.getElementById('slideshow-container');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const photoUpload = document.getElementById('photo-upload');

  function fetchGalleryImages(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;
    
    fetch(SCRIPT_URL)
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

    if (currentSlide >= defaultGallery.length) {
      currentSlide = 0;
    }

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

  if (photoUpload) {
    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const uploaderName = prompt("Sila masukkan nama anda:", "Tetamu Undangan") || "Tetamu";
        const imageCaption = prompt("Tuliskan kapsyen ringkas untuk gambar ini:", "Kenangan Majlis") || "Kenangan Majlis";

        // Ganti alert prompt status muat naik dengan elemen teks status jika perlu, atau kekalkan notifikasi lembut
        const galleryAlert = document.getElementById('gallery-alert');
        if (galleryAlert) {
          galleryAlert.innerText = "Sedang memproses dan memuat naik gambar resolusi penuh...";
          galleryAlert.classList.remove('hidden');
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.src = e.target.result;
          img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const originalDataUrl = canvas.toDataURL('image/jpeg', 1.0);
            const base64String = originalDataUrl.split(',')[1];

            const formData = new URLSearchParams();
            formData.append('action', 'gallery');
            formData.append('fileName', file.name.replace(/\.[^/.]+$/, "") + ".jpg");
            formData.append('mimeType', 'image/jpeg');
            formData.append('fileData', base64String);
            formData.append('name', uploaderName);
            formData.append('caption', imageCaption);

            fetch(SCRIPT_URL, {
              method: 'POST',
              body: formData
            })
            .then(response => response.json())
            .then(data => {
              if (galleryAlert) {
                galleryAlert.innerText = "Berjaya! Gambar resolusi penuh anda telah disimpan.";
                setTimeout(() => galleryAlert.classList.add('hidden'), 5000);
              }
              fetchGalleryImages();
            })
            .catch(error => {
              console.error('Upload error:', error);
              if (galleryAlert) {
                galleryAlert.innerText = "Gagal memuat naik gambar. Sila cuba lagi.";
              }
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }

  fetchGalleryImages();
  setInterval(() => {
    fetchGalleryImages(true);
  }, 10000);


  /* -------------------------------------------------------------
     7. Wish Board / Buku Hajat (Optimized Real-Time Sync)
  ------------------------------------------------------------- */
  let defaultWishes = [
    {
      name: "Systems",
      message: "Titipkan sepotong doa, pesanan, atau hajat buat mengiringi mahligai cinta pasangan.",
      timestamp: new Date().toISOString()
    }
  ];

  let isUsingWishFallback = false;

  function getRelativeTime(timestamp) {
    if (!timestamp) return "Baru sahaja";
    
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp.replace(/-/g, "/"));
    } else {
      date = new Date(timestamp);
    }

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
        <p class="text-xs sm:text-sm text-purpleTheme-800/90 leading-relaxed font-light whitespace-pre-line break-all">${w.message}</p>
      </div>
    `).join('');
  }

  function updateLiveTimestamps() {
    const timeElements = document.querySelectorAll('.wish-time');
    timeElements.forEach(el => {
      const timestamp = el.getAttribute('data-timestamp');
      if (timestamp) {
        el.innerText = getRelativeTime(timestamp);
      }
    });
  }

  function fetchWishes(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;

    fetch(`${SCRIPT_URL}?action=wishes`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const newWishes = data.map(item => ({
            name: item.name,
            message: item.message,
            timestamp: item.timestamp
          })).reverse();

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
      const submitBtn = wishForm.querySelector('button[type="submit"]');

      if (nameInput.value && msgInput.value) {
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
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          nameInput.value = '';
          msgInput.value = '';
          if (submitBtn) {
            submitBtn.innerText = "Hantar Ucapan";
            submitBtn.disabled = false;
          }
          
          // Paparkan kotak notifikasi inline yang seragam seperti RSVP
          const wishAlert = document.getElementById('wish-alert');
          if (wishAlert) {
            wishAlert.classList.remove('hidden');
            setTimeout(() => {
              wishAlert.classList.add('hidden');
            }, 5000);
          }
          
          fetchWishes();
        })
        .catch(error => {
          console.error('Wish Error:', error);
          const wishAlert = document.getElementById('wish-alert');
          if (wishAlert) {
            wishAlert.innerText = "Terdapat masalah semasa menghantar ucapan. Sila cuba lagi.";
            wishAlert.classList.remove('hidden');
            setTimeout(() => {
              wishAlert.classList.add('hidden');
            }, 5000);
          }
          if (submitBtn) {
            submitBtn.innerText = "Hantar Ucapan";
            submitBtn.disabled = false;
          }
        });
      }
    });
  }

  fetchWishes();
  setInterval(() => {
    fetchWishes(true);
  }, 5000);

  setInterval(() => {
    updateLiveTimestamps();
  }, 30000);
  
  
  /* -------------------------------------------------------------
     8. Gallery Lightbox / Preview Feature (Original Resolution Pull)
  ------------------------------------------------------------- */
  if (slideshowContainer) {
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

    slideshowContainer.addEventListener('click', (e) => {
      if (e.target.closest('#prev-slide') || e.target.closest('#next-slide')) return;
      
      if (slideImg && slideImg.src) {
        let rawUrl = slideImg.src;

        if (rawUrl.includes('googleusercontent.com')) {
          rawUrl = rawUrl.split('=')[0] + '=s0';
        }

        modalImg.src = rawUrl;
        modalCaption.innerText = slideCaption ? slideCaption.innerText : '';
        modal.classList.remove('hidden');
      }
    });

    modal.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

});