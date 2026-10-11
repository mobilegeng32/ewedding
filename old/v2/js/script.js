// Target Wedding Date: 22 May 2027, 12:00:00
const weddingDate = new Date("May 22, 2027 12:00:00").getTime();

// Countdown Timer Logic
function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance > 0) {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
  } else {
    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
      countdownEl.innerHTML = "<div class='col-span-4 font-bold text-center text-yellow-300'>MAJLIS SEDANG BERLANGSUNG!</div>";
    }
  }
}

// Update timer every second
setInterval(updateCountdown, 1000);
updateCountdown();

// Audio Player Control
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicToggleMobile = document.getElementById("musicToggleMobile");
let isPlaying = false;

function toggleAudio() {
  if (!bgMusic) return;

  if (isPlaying) {
    bgMusic.pause();
    if (musicToggle) musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
    if (musicToggleMobile) musicToggleMobile.innerHTML = '<i class="fa-solid fa-music"></i>';
    isPlaying = false;
  } else {
    bgMusic.play().then(() => {
      if (musicToggle) musicToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      if (musicToggleMobile) musicToggleMobile.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      isPlaying = true;
    }).catch(err => console.log("Ralat memainkan audio:", err));
  }
}

if (musicToggle) {
  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAudio();
  });
}

if (musicToggleMobile) {
  musicToggleMobile.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAudio();
  });
}

// Auto-play Muzik pada Interaksi Pertama (Klik/Sentuh Mana-mana Bahagian Skrin)
document.addEventListener('click', function musicAutoplayOnce() {
  if (bgMusic && bgMusic.paused && !isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      if (musicToggle) musicToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      if (musicToggleMobile) musicToggleMobile.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }).catch(error => {
      console.log("Autoplay disekat oleh pelayar sehingga interaksi fizikal seterusnya:", error);
    });
  }
}, { once: true });

// Modal Dialog Controls
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

// RSVP Form Handler
function handleRSVP(e) {
  e.preventDefault();
  alert("Terima kasih! Pengesahan kehadiran anda telah berjaya dihantar.");
  closeModal('modal-rsvp');
}

// Wishes Form Handler
function handleWish(e) {
  e.preventDefault();
  const nameEl = document.getElementById("wishName");
  const textEl = document.getElementById("wishText");
  
  if (!nameEl || !textEl) return;

  const name = nameEl.value;
  const text = textEl.value;
  
  const wishesList = document.getElementById("wishesList");
  if (wishesList) {
    const newWish = document.createElement("div");
    newWish.className = "bg-purple-900/5 p-2.5 rounded-lg text-xs animate-fadeIn";
    newWish.innerHTML = `<p class="font-bold text-purple-900">${name}</p><p class="text-purple-800 italic">"${text}"</p>`;
    wishesList.prepend(newWish);
  }

  nameEl.value = "";
  textEl.value = "";
  alert("Terima kasih atas ucapan & doa anda!");
}

// Calendar Export Action
function addToCalendar(type) {
  alert(`Menambah ke ${type.toUpperCase()} Calendar...`);
}

// Fungsi untuk buka/tutup menu dropdown mudah alih (Mobile Hamburger Menu)
function toggleMobileMenu() {
  const dropdown = document.getElementById("mobileDropdown");
  const menuIcon = document.getElementById("menuIcon");
  
  if (!dropdown || !menuIcon) return;

  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("flex");
    menuIcon.className = "fa-solid fa-xmark"; // Tukar jadi ikon pangkah (X)
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("flex");
    menuIcon.className = "fa-solid fa-bars"; // Tukar balik jadi ikon garis 3
  }
}