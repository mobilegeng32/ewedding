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
      const targetId = this.getAttribute('href');[cite: 6]
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
  const bgMusic = document.getElementById('bg-music');[cite: 6]
  const musicBtn = document.getElementById('music-toggle');[cite: 6]
  const musicIcon = document.getElementById('music-icon');[cite: 6]
  let isPlaying = false;[cite: 6]
  let hasInteracted = false;[cite: 6]

  function triggerAudioPlay() {
    if (!hasInteracted && bgMusic) {
      bgMusic.play().then(() => {
        if (musicIcon) musicIcon.className = 'fas fa-pause text-lg';[cite: 6]
        isPlaying = true;[cite: 6]
        hasInteracted = true;[cite: 6]
        window.removeEventListener('click', triggerAudioPlay);[cite: 6]
        window.removeEventListener('scroll', triggerAudioPlay);[cite: 6]
        window.removeEventListener('touchstart', triggerAudioPlay);[cite: 6]
      }).catch((error) => {
        console.log("Autoplay disekat oleh pelayar:", error);[cite: 6]
      });
    }
  }

  window.addEventListener('click', triggerAudioPlay);[cite: 6]
  window.addEventListener('scroll', triggerAudioPlay);[cite: 6]
  window.addEventListener('touchstart', triggerAudioPlay);[cite: 6]

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();[cite: 6]
      if (isPlaying) {
        bgMusic.pause();[cite: 6]
        if (musicIcon) musicIcon.className = 'fas fa-music text-lg';[cite: 6]
      } else {
        bgMusic.play().then(() => {
          if (musicIcon) musicIcon.className = 'fas fa-pause text-lg';[cite: 6]
        }).catch((err) => {
          console.log("Audio play error:", err);[cite: 6]
        });
      }
      isPlaying = !isPlaying;[cite: 6]
      hasInteracted = true;[cite: 6]
    });
  }


  /* -------------------------------------------------------------
     3. Live Countdown Timer
  ------------------------------------------------------------- */
  const weddingDate = new Date('May 22, 2027 10:00:00').getTime();[cite: 6]

  function updateCountdown() {
    const now = new Date().getTime();[cite: 6]
    const distance = weddingDate - now;[cite: 6]

    const daysEl = document.getElementById('cd-days');[cite: 6]
    const hoursEl = document.getElementById('cd-hours');[cite: 6]
    const minutesEl = document.getElementById('cd-minutes');[cite: 6]
    const secondsEl = document.getElementById('cd-seconds');[cite: 6]

    if (!daysEl) return;[cite: 6]

    if (distance < 0) {
      daysEl.innerText = "00";[cite: 6]
      hoursEl.innerText = "00";[cite: 6]
      minutesEl.innerText = "00";[cite: 6]
      secondsEl.innerText = "00";[cite: 6]
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));[cite: 6]
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));[cite: 6]
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));[cite: 6]
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);[cite: 6]

    daysEl.innerText = days < 10 ? '0' + days : days;[cite: 6]
    hoursEl.innerText = hours < 10 ? '0' + hours : hours;[cite: 6]
    minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;[cite: 6]
    secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;[cite: 6]
  }

  setInterval(updateCountdown, 1000);[cite: 6]
  updateCountdown();[cite: 6]


  /* -------------------------------------------------------------
     4. Add to Calendar ICS Generator
  ------------------------------------------------------------- */
  const calBtn = document.getElementById('add-calendar-btn');[cite: 6]
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
END:VCALENDAR`;[cite: 6]

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });[cite: 6]
      const link = document.createElement('a');[cite: 6]
      link.href = window.URL.createObjectURL(blob);[cite: 6]
      link.setAttribute('download', 'Majlis_Nikah_Utrias_Hazim.ics');[cite: 6]
      document.body.appendChild(link);[cite: 6]
      link.click();[cite: 6]
      document.body.removeChild(link);[cite: 6]
    });
  }


  /* -------------------------------------------------------------
     5. RSVP Submission Logic (Google Sheets via URLSearchParams)
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');[cite: 6]
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();[cite: 6]
      
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');[cite: 6]
      const originalBtnText = submitBtn.innerText;[cite: 6]
      submitBtn.innerText = "Sedang Hantar...";[cite: 6]
      submitBtn.disabled = true;[cite: 6]

      const formData = new URLSearchParams();[cite: 6]
      formData.append('action', 'rsvp');[cite: 6]
      formData.append('name', document.getElementById('rsvp-name').value);[cite: 6]
      formData.append('phone', document.getElementById('rsvp-phone').value);[cite: 6]
      formData.append('status', document.getElementById('rsvp-status').value);[cite: 6]
      formData.append('pax', document.getElementById('rsvp-pax').value);[cite: 6]

      fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        const alertBox = document.getElementById('rsvp-alert');[cite: 6]
        if (alertBox) {
          alertBox.classList.remove('hidden');[cite: 6]
          rsvpForm.reset();[cite: 6]
          setTimeout(() => {
            alertBox.classList.add('hidden');[cite: 6]
          }, 5000);
        }
        submitBtn.innerText = originalBtnText;[cite: 6]
        submitBtn.disabled = false;[cite: 6]
      })
      .catch(error => {
        console.error('RSVP Error:', error);[cite: 6]
        alert('Terdapat masalah semasa menghantar RSVP. Sila cuba lagi.');[cite: 6]
        submitBtn.innerText = originalBtnText;[cite: 6]
        submitBtn.disabled = false;[cite: 6]
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
  ];[cite: 6]

  let defaultGallery = [];[cite: 6]
  let currentSlide = 0;[cite: 6]
  let slideTimer = null;[cite: 6]
  let isUsingFallback = false;[cite: 6]
  
  const slideImg = document.getElementById('slideshow-img');[cite: 6]
  const slideCaption = document.getElementById('slideshow-caption');[cite: 6]
  const slideshowContainer = document.getElementById('slideshow-container');[cite: 6]
  const prevBtn = document.getElementById('prev-slide');[cite: 6]
  const nextBtn = document.getElementById('next-slide');[cite: 6]
  const photoUpload = document.getElementById('photo-upload');[cite: 6]

  function fetchGalleryImages(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;[cite: 6]
    
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const newGallery = data.map(item => ({
            url: item.url,
            caption: `${item.caption} (Oleh: ${item.name})`
          }));[cite: 6]

          if (JSON.stringify(newGallery) !== JSON.stringify(defaultGallery)) {
            defaultGallery = newGallery;[cite: 6]
            isUsingFallback = false;[cite: 6]
            if (!isBackgroundCheck) {
              currentSlide = 0;[cite: 6]
              renderSlide();[cite: 6]
            }
          }
        } else {
          if (!isUsingFallback) {
            defaultGallery = [...fallbackGallery];[cite: 6]
            isUsingFallback = true;[cite: 6]
            currentSlide = 0;[cite: 6]
            renderSlide();[cite: 6]
          }
        }
      })
      .catch(err => console.log("Gagal memuat galeri:", err));[cite: 6]
  }

  function renderSlide() {
    if (!slideImg || !slideCaption || defaultGallery.length === 0) return;[cite: 6]
    
    if (slideTimer) clearTimeout(slideTimer);[cite: 6]

    if (currentSlide >= defaultGallery.length) {
      currentSlide = 0;[cite: 6]
    }

    const currentImageUrl = defaultGallery[currentSlide].url;[cite: 6]
    const currentText = defaultGallery[currentSlide].caption;[cite: 6]

    slideImg.style.opacity = '0.3';[cite: 6]

    setTimeout(() => {
      slideImg.src = currentImageUrl;[cite: 6]
      slideCaption.innerText = currentText;[cite: 6]
      slideImg.style.opacity = '1';[cite: 6]
    }, 200);

    slideTimer = setTimeout(() => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;[cite: 6]
      renderSlide();[cite: 6]
    }, 10000);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + defaultGallery.length) % defaultGallery.length;[cite: 6]
      renderSlide();[cite: 6] 
    });

    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;[cite: 6]
      renderSlide();[cite: 6] 
    });
  }

  if (photoUpload) {
    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];[cite: 6]
      if (file) {
        const uploaderName = prompt("Sila masukkan nama anda:", "Tetamu Undangan") || "Tetamu";[cite: 6]
        const imageCaption = prompt("Tuliskan kapsyen ringkas untuk gambar ini:", "Kenangan Majlis") || "Kenangan Majlis";[cite: 6]

        alert("Sedang memproses dan memuat naik saiz piksel asal penuh ke server... Sila tunggu sebentar.");[cite: 6]

        const reader = new FileReader();[cite: 6]
        reader.onload = function(e) {
          const img = new Image();[cite: 6]
          img.src = e.target.result;[cite: 6]
          img.onload = function() {
            const canvas = document.createElement('canvas');[cite: 6]
            canvas.width = img.width;[cite: 6]
            canvas.height = img.height;[cite: 6]
            const ctx = canvas.getContext('2d');[cite: 6]
            ctx.drawImage(img, 0, 0);[cite: 6]

            const originalDataUrl = canvas.toDataURL('image/jpeg', 1.0);[cite: 6]
            const base64String = originalDataUrl.split(',')[1];[cite: 6]

            const formData = new URLSearchParams();[cite: 6]
            formData.append('action', 'gallery');[cite: 6]
            formData.append('fileName', file.name.replace(/\.[^/.]+$/, "") + ".jpg");[cite: 6]
            formData.append('mimeType', 'image/jpeg');[cite: 6]
            formData.append('fileData', base64String);[cite: 6]
            formData.append('name', uploaderName);[cite: 6]
            formData.append('caption', imageCaption);[cite: 6]

            fetch(SCRIPT_URL, {
              method: 'POST',
              body: formData
            })
            .then(response => response.json())
            .then(data => {
              alert("Berjaya! Gambar resolusi penuh asal anda telah disimpan.");[cite: 6]
              fetchGalleryImages();[cite: 6]
            })
            .catch(error => {
              console.error('Upload error:', error);[cite: 6]
              alert('Gagal memuat naik gambar. Sila cuba lagi.');[cite: 6]
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }

  fetchGalleryImages();[cite: 6]
  setInterval(() => {
    fetchGalleryImages(true);[cite: 6]
  }, 10000);


  /* -------------------------------------------------------------
     7. Wish Board / Buku Hajat (Auto Live Real-Time Timestamp Sync)
  ------------------------------------------------------------- */
  let defaultWishes = [
    {
      name: "Systems",
      message: "Titipkan sepotong doa, pesanan, atau hajat buat mengiringi mahligai cinta pasangan.",
      timestamp: new Date().toISOString()
    }
  ];[cite: 6]

  let isUsingWishFallback = false;[cite: 6]

  // Fungsi mengira beza masa secara automatik merentas pelayar
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
    const container = document.getElementById('wishes-container');[cite: 6]
    if (!container) return;[cite: 6]
    
    container.innerHTML = defaultWishes.map(w => `
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purpleTheme-100 shadow-sm space-y-1.5 transition-all">
        <div class="flex items-center justify-between border-b border-purpleTheme-50 pb-1.5">
          <h4 class="font-serif font-semibold text-purpleTheme-900 text-sm sm:text-base">${w.name}</h4>
          <!-- Menyimpan timestamp asal untuk pengiraan automatik setiap saat -->
          <span class="text-[10px] text-purpleTheme-700/60 font-light wish-time" data-timestamp="${w.timestamp || ''}">${getRelativeTime(w.timestamp)}</span>
        </div>
        <p class="text-xs sm:text-sm text-purpleTheme-800/90 leading-relaxed font-light whitespace-pre-line break-all">${w.message}</p>
      </div>
    `).join('');
  }

  // Fungsi pengemaskinian teks masa secara langsung di skrin setiap 1 saat
  function updateLiveTimestamps() {
    const timeElements = document.querySelectorAll('.wish-time');[cite: 6]
    timeElements.forEach(el => {
      const timestamp = el.getAttribute('data-timestamp');[cite: 6]
      if (timestamp) {
        el.innerText = getRelativeTime(timestamp);[cite: 6]
      }
    });
  }

  function fetchWishes(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;[cite: 6]

    fetch(`${SCRIPT_URL}?action=wishes`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const newWishes = data.map(item => ({
            name: item.name,
            message: item.message,
            timestamp: item.timestamp
          })).reverse();[cite: 6]

          const oldWishesSimple = defaultWishes.map(w => ({ name: w.name, message: w.message }));[cite: 6]
          const newWishesSimple = newWishes.map(w => ({ name: w.name, message: w.message }));[cite: 6]

          if (JSON.stringify(newWishesSimple) !== JSON.stringify(oldWishesSimple)) {
            defaultWishes = newWishes;[cite: 6]
            isUsingWishFallback = false;[cite: 6]
            renderWishes();[cite: 6]
          }
        } else {
          if (!isUsingWishFallback && !isBackgroundCheck) {
            isUsingWishFallback = true;[cite: 6]
            renderWishes();[cite: 6]
          }
        }
      })
      .catch(err => console.log("Gagal memuat ucapan:", err));[cite: 6]
  }

  const wishForm = document.getElementById('wish-form');[cite: 6]
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();[cite: 6]
      const nameInput = document.getElementById('wish-name');[cite: 6]
      const msgInput = document.getElementById('wish-message');[cite: 6]
      const submitBtn = wishForm.querySelector('button[type="submit"]');[cite: 6]

      if (nameInput.value && msgInput.value) {
        if (submitBtn) {
          submitBtn.innerText = "Sedang Hantar...";[cite: 6]
          submitBtn.disabled = true;[cite: 6]
        }

        const formData = new URLSearchParams();[cite: 6]
        formData.append('action', 'wishes');[cite: 6]
        formData.append('name', nameInput.value);[cite: 6]
        formData.append('message', msgInput.value);[cite: 6]

        fetch(SCRIPT_URL, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          nameInput.value = '';[cite: 6]
          msgInput.value = '';[cite: 6]
          if (submitBtn) {
            submitBtn.innerText = "Hantar Ucapan";[cite: 6]
            submitBtn.disabled = false;[cite: 6]
          }
          
          alert("Terima kasih! Ucapan dan doa restu anda telah berjaya direkodkan untuk pengantin. 🤍");[cite: 6]
          
          fetchWishes();[cite: 6]
        })
        .catch(error => {
          console.error('Wish Error:', error);[cite: 6]
          alert('Terdapat masalah semasa menghantar ucapan. Sila cuba lagi.');[cite: 6]
          if (submitBtn) {
            submitBtn.innerText = "Hantar Ucapan";[cite: 6]
            submitBtn.disabled = false;[cite: 6]
          }
        });
      }
    });
  }

  // 1. Tarik data awal & semak kemas kini latar belakang setiap 3 saat merentas peranti
  fetchWishes();[cite: 6]
  setInterval(() => {
    fetchWishes(true);[cite: 6]
  }, 3000);

  // 2. Kemas kini paparan teks masa secara automatik di skrin SETIAP 1 SAAT
  setInterval(() => {
    updateLiveTimestamps();[cite: 6]
  }, 1000);
  
  
  /* -------------------------------------------------------------
     8. Gallery Lightbox / Preview Feature (Original Resolution Pull)
  ------------------------------------------------------------- */
  if (slideshowContainer) {
    const modal = document.createElement('div');[cite: 6]
    modal.id = 'gallery-modal';[cite: 6]
    modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center hidden p-4 cursor-pointer';[cite: 6]
    modal.innerHTML = `
      <div class="relative max-w-5xl max-h-full flex flex-col items-center">
        <span class="absolute -top-10 right-0 text-white text-3xl font-bold cursor-pointer">&times;</span>
        <img id="modal-img" class="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" src="" alt="Preview">
        <p id="modal-caption" class="text-white text-sm mt-3 italic text-center"></p>
      </div>
    `;[cite: 6]
    document.body.appendChild(modal);[cite: 6]

    const modalImg = document.getElementById('modal-img');[cite: 6]
    const modalCaption = document.getElementById('modal-caption');[cite: 6]

    slideshowContainer.addEventListener('click', (e) => {
      if (e.target.closest('#prev-slide') || e.target.closest('#next-slide')) return;[cite: 6]
      
      if (slideImg && slideImg.src) {
        let rawUrl = slideImg.src;[cite: 6]

        if (rawUrl.includes('googleusercontent.com')) {
          rawUrl = rawUrl.split('=')[0] + '=s0';[cite: 6]
        }

        modalImg.src = rawUrl;[cite: 6]
        modalCaption.innerText = slideCaption ? slideCaption.innerText : '';[cite: 6]
        modal.classList.remove('hidden');[cite: 6]
      }
    });

    modal.addEventListener('click', () => {
      modal.classList.add('hidden');[cite: 6]
    });
  }

});