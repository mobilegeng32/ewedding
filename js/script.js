/* -------------------------------------------------------------
   1. Background Music Controller
------------------------------------------------------------- */
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause();
    musicIcon.className = 'fas fa-music text-lg';
  } else {
    bgMusic.play().then(() => {
      musicIcon.className = 'fas fa-pause text-lg';
    }).catch(() => {
      console.log("Autoplay failed or interaction needed.");
    });
  }
  isPlaying = !isPlaying;
});

/* -------------------------------------------------------------
   2. Live Countdown Timer Logic
------------------------------------------------------------- */
const weddingDate = new Date('May 27, 2027 12:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance < 0) {
    document.getElementById('cd-days').innerText = "00";
    document.getElementById('cd-hours').innerText = "00";
    document.getElementById('cd-minutes').innerText = "00";
    document.getElementById('cd-seconds').innerText = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('cd-days').innerText = days < 10 ? '0' + days : days;
  document.getElementById('cd-hours').innerText = hours < 10 ? '0' + hours : hours;
  document.getElementById('cd-minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
  document.getElementById('cd-seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* -------------------------------------------------------------
   3. Add to Calendar ICS Generator
------------------------------------------------------------- */
function addToCalendar() {
  const icsData = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Digital Wedding Invitation//EN
BEGIN:VEVENT
SUMMARY:Majlis Nikah Utrias & Hazim
DESCRIPTION:Undangan Majlis Akad Nikah Utrias & Hazim
LOCATION:Dewan Serbaguna Cyberjaya, Persiaran APEC, 63000 Cyberjaya, Selangor
DTSTART:20261128T020000Z
DTEND:20261128T060000Z
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'Majlis_Nikah_Utrias_Hazim.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* -------------------------------------------------------------
   4. RSVP Submission Logic
------------------------------------------------------------- */
function submitRSVP(e) {
  e.preventDefault();
  const alertBox = document.getElementById('rsvp-alert');
  alertBox.classList.remove('hidden');
  document.getElementById('rsvp-form').reset();

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 5000);
}

/* -------------------------------------------------------------
   5. Gallery Slideshow & Guest Photo Upload
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

function renderSlide() {
  const imgEl = document.getElementById('slideshow-img');
  const captionEl = document.getElementById('slideshow-caption');
  
  imgEl.style.opacity = '0.3';
  setTimeout(() => {
    imgEl.src = defaultGallery[currentSlide].url;
    captionEl.innerText = defaultGallery[currentSlide].caption;
    imgEl.style.opacity = '1';
  }, 200);
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % defaultGallery.length;
  renderSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + defaultGallery.length) % defaultGallery.length;
  renderSlide();
}

// Auto Advance Slideshow
setInterval(nextSlide, 5000);

// Guest Upload Feature (Dynamic Local Preview)
function handleImageUpload(event) {
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
}

/* -------------------------------------------------------------
   6. Wish Board Logic (Pre-populated sample wishes)
------------------------------------------------------------- */
const wishesList = [
  {
    name: "Farhan & Amira",
    message: "Selamat pengantin baru Aiman & Sofia! Semoga ikatan perkahwinan ini berkekalan hingga ke jannah walaupun berbeza negara.",
    time: "Baru sahaja"
  },
  {
    name: "Mak Cik Salmah",
    message: "Tahniah buat kedua-dua anakanda. Moga dipermudahkan segala urusan majlis nikah nanti.",
    time: "2 jam yang lalu"
  },
  {
    name: "Dr. Daniel",
    message: "Barakallahulakuma! So happy for both of you across borders. Wishing you a lifetime of happiness!",
    time: "1 hari yang lalu"
  }
];

function renderWishes() {
  const container = document.getElementById('wishes-container');
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

function submitWish(e) {
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
}

// Initial load
renderWishes();