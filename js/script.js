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

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
  } else {
    document.getElementById("countdown").innerHTML = 
      "<div class='col-span-4 font-bold text-center text-yellow-300'>MAJLIS SEDANG BERLANGSUNG!</div>";
  }
}

// Update timer every second
setInterval(updateCountdown, 1000);
updateCountdown();

// Audio Player Control
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
let isPlaying = false;

if (musicToggle) {
  musicToggle.addEventListener("click", (e) => {
    // Hentikan penularan event supaya tidak bertembung dengan event click global
    e.stopPropagation();
    
    if (isPlaying) {
      bgMusic.pause();
      musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
    } else {
      bgMusic.play().then(() => {
        musicToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }).catch(err => console.log("Ralat memainkan audio:", err));
    }
    isPlaying = !isPlaying;
  });
}

// Auto-play Muzik pada Interaksi Pertama (Klik/Sentuh Mana-mana Bahagian Skrin)
document.addEventListener('click', function musicAutoplayOnce() {
  if (bgMusic && bgMusic.paused && !isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      if (musicToggle) {
        musicToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    }).catch(error => {
      console.log("Autoplay disekat oleh pelayar sehingga interaksi fizikal seterusnya:", error);
    });
  }
}, { once: true });

// Modal Dialog Controls
function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
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
  const name = document.getElementById("wishName").value;
  const text = document.getElementById("wishText").value;
  
  const wishesList = document.getElementById("wishesList");
  const newWish = document.createElement("div");
  newWish.className = "bg-purple-900/5 p-2.5 rounded-lg text-xs animate-fadeIn";
  newWish.innerHTML = `<p class="font-bold text-purple-900">${name}</p><p class="text-purple-800 italic">"${text}"</p>`;
  
  wishesList.prepend(newWish);
  document.getElementById("wishName").value = "";
  document.getElementById("wishText").value = "";
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

// Sinkronisasi butang muzik mudah alih dengan butang desktop
const musicToggleMobile = document.getElementById("musicToggleMobile");
if (musicToggleMobile && musicToggle) {
  musicToggleMobile.addEventListener("click", (e) => {
    e.stopPropagation();
    musicToggle.click(); // Cetuskan fungsi klik butang muzik utama
  });
}