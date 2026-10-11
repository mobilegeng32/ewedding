document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
     1. Smooth Scroll Handler (Fix Smooth Scroll)
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
     1. Background Music Controller & Auto-play on First Interaction
  ------------------------------------------------------------- */
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  let isPlaying = false;
  let hasInteracted = false;

  // Fungsi untuk mainkan audio apabila interaksi pertama berlaku
  function triggerAudioPlay() {
    if (!hasInteracted && bgMusic) {
      bgMusic.play().then(() => {
        if (musicIcon) musicIcon.className = 'fas fa-pause text-lg';
        isPlaying = true;
        hasInteracted = true;
        // Padam event listener selepas audio mula dimainkan
        window.removeEventListener('click', triggerAudioPlay);
        window.removeEventListener('scroll', triggerAudioPlay);
        window.removeEventListener('touchstart', triggerAudioPlay);
      }).catch((error) => {
        console.log("Autoplay disekat oleh pelayar:", error);
      });
    }
  }

  // Aktifkan pencetus apabila tetamu mula klik, skrol atau sentuh skrin
  window.addEventListener('click', triggerAudioPlay);
  window.addEventListener('scroll', triggerAudioPlay);
  window.addEventListener('touchstart', triggerAudioPlay);

  // Kawalan manual butang muzik di skrin
  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Elak bertembung dengan event window click
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
      hasInteracted = true; // Anggap pengguna sudah berinteraksi
    });
  }

  /* -------------------------------------------------------------
     3. Live Countdown Timer (Fix Timer)
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
     4. Add to Calendar ICS Generator (Fix Download ICS)
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
     5. RSVP Submission Logic
  ------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('rsvp-alert');
      if (alertBox) {
        alertBox.classList.remove('hidden');
        rsvpForm.reset();
        setTimeout(() => {
          alertBox.classList.add('hidden');
        }, 5000);
      }
    });
  }

  /* -------------------------------------------------------------
     6. Gallery Slideshow & Guest Photo Upload
  ------------------------------------------------------------- */
  const defaultGallery = [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      caption: "Detik Manis Bersama"
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      caption: "Semangat Bersama Merentas Sempadan"
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
      caption: "Persiapan Hari Bahagia"
    }
  ];

  let currentSlide = 0;
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const photoUpload = document.getElementById('photo-upload');

  function renderSlide() {
    if (!slideImg || !slideCaption) return;
    slideImg.style.opacity = '0.3';
    setTimeout(() => {
      slideImg.src = defaultGallery[currentSlide].url;
      slideCaption.innerText = defaultGallery[currentSlide].caption;
      slideImg.style.opacity = '1';
    }, 200);
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

  setInterval(() => {
    if (slideImg) {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide();
    }
  }, 5000);

  if (photoUpload) {
    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          defaultGallery.unshift({
            url: e.target.result,
            caption: "Gambar Dimuat Naik Oleh Tetamu"
          });
          currentSlide = 0;
          renderSlide();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* -------------------------------------------------------------
     7. Wish Board Logic
  ------------------------------------------------------------- */
  const wishesList = [
    {
      name: "Farhan & Amira",
      message: "Selamat pengantin baru Utrias & Hazim! Semoga ikatan perkahwinan ini berkekalan hingga ke jannah.",
      time: "Baru sahaja"
    },
    {
      name: "Mak Cik Salmah",
      message: "Tahniah buat kedua-dua anakanda. Moga dipermudahkan segala urusan majlis nikah nanti.",
      time: "2 jam yang lalu"
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