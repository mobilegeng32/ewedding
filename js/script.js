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
     6. Dynamic Gallery & Google Drive/Sheets Integration (Real-Time & Clean Logic)
  ------------------------------------------------------------- */
  const fallbackGallery = [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      caption: "Detik Manis Bersama (Default)"
    }
  ];

  let defaultGallery = [];
  let currentSlide = 0;
  let slideTimer = null;
  let isUsingFallback = false; // Penanda untuk tentukan sama ada guna gambar default atau tidak
  
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const photoUpload = document.getElementById('photo-upload');

  // Tarik senarai gambar dari Google Sheets & Drive secara real-time
  function fetchGalleryImages(isBackgroundCheck = false) {
    if (!SCRIPT_URL.includes('http')) return;
    
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Jika ada gambar dalam Sheets, GUNAKAN DATA SHEETS SEPENUHNYA (Default image dibuang)
          const newGallery = data.map(item => ({
            url: item.url,
            caption: `${item.caption} (Oleh: ${item.name})`
          }));

          // Semak sama ada senarai berubah atau baru pertama kali muat
          if (JSON.stringify(newGallery) !== JSON.stringify(defaultGallery)) {
            defaultGallery = newGallery;
            isUsingFallback = false;
            if (!isBackgroundCheck) {
              currentSlide = 0;
              renderSlide();
            }
          }
        } else {
          // Jika Google Sheet KOSONG, baru guna gambar fallback/default
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

    // Pastikan index currentSlide tidak terkeluar dari had array
    if (currentSlide >= defaultGallery.length) {
      currentSlide = 0;
    }

    slideImg.style.opacity = '0.3';
    setTimeout(() => {
      slideImg.src = defaultGallery[currentSlide].url;
      slideCaption.innerText = defaultGallery[currentSlide].caption;
      slideImg.style.opacity = '1';
    }, 200);

    // Transisi automatik setiap 10 saat (10000ms)
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

        alert("Sedang memproses dan memuat naik gambar ke server... Sila tunggu sebentar.");

        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.src = e.target.result;
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            const base64String = compressedDataUrl.split(',')[1];

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
              alert("Berjaya! Gambar anda telah disimpan di dalam Google Drive.");
              fetchGalleryImages(); // Terus tarik data terkini
            })
            .catch(error => {
              console.error('Upload error:', error);
              alert('Gagal memuat naik gambar. Sila cuba lagi.');
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Muat turun data awal semasa laman web dibuka
  fetchGalleryImages();

  // Real-time background sync: Semak perubahan / pemadaman dalam Google Sheet setiap 10 saat secara automatik
  setInterval(() => {
    fetchGalleryImages(true);
  }, 10000);

  /* -------------------------------------------------------------
     7. Wish Board / Buku Hajat (Local UI Simulation)
  ------------------------------------------------------------- */
  const wishesList = [
    {
      name: "Farhan & Amira",
      message: "Selamat pengantin baru Utrias & Hazim! Semoga ikatan perkahwinan ini berkekalan hingga ke jannah.",
      time: "Baru sahaja"
    }
  ];

  function renderWishes() {
    const container = document.getElementById('wishes-container');
    if (!container) return;
    container.innerHTML = wishesList.map(w => `
      <div class="glass-card rounded-2xl p-5 border border-purpleTheme-100 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="font-serif font-semibold text-purpleTheme-900">${w.name}</h4>
          <span class="text-[10px] text-purpleTheme-700/60 font-light">${w.time}</span>
        </div>
        <p class="text-xs sm:text-sm text-purpleTheme-800/80 leading-relaxed font-light">${w.message}</p>
      </div>
    `).join('');
  }

  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name');
      const msgInput = document.getElementById('wish-message');

      if (nameInput.value && msgInput.value) {
        wishesList.unshift({
          name: nameInput.value,
          message: msgInput.value,
          time: "Baru sahaja"
        });
        renderWishes();
        nameInput.value = '';
        msgInput.value = '';
      }
    });
  }

  renderWishes();

});