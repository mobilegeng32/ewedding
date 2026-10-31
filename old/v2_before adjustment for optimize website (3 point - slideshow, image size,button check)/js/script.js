/**
 * =================================================================<br>
 * DIGITAL WEDDING INVITATION - MAIN SCRIPT<br>
 * =================================================================
 */

// Tetapan awal tetingkap (Elak auto-scroll pelayar ke posisi asal semasa muat semula)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. KONFIGURASI UTAMA API & GOOGLE SHEETS ---
  // URL Google Apps Script HANYA untuk proses Tulis (Write: doPost)
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwC0NCpQLF2bq629RZsFuIiddVUWCQlG-jknzv3zLCwYPIIrv_lhiKNeabYte7azNFc/exec';
  
  // ID Google Sheets anda untuk proses Baca (Read: GViz)
  const SPREADSHEET_ID = '1JGP59v8YPvFqp64lUHgaVfdxKUZ5x8S4Mu_ujcxNsyI'; 
  
  // --- 2. FUNGSI BANTUAN GVIZ (BACA DATA DARI SHEET) ---
  function fetchSheetDataViaGViz(sheetName, callback) {
    if (!SPREADSHEET_ID || SPREADSHEET_ID.includes('MASUKKAN')) return;

    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

    fetch(url)
      .then(res => res.text())
      .then(text => {
        const startIdx = text.indexOf('setResponse(');
        if (startIdx === -1) return;
        
        const jsonString = text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')'));
        const json = JSON.parse(jsonString);
        
        const cols = json.table.cols.map(col => (col.label || col.id || '').trim().toLowerCase());

        const rows = json.table.rows.map(row => {
          let obj = {};
          if (row && row.c) {
            row.c.forEach((cell, index) => {
              let val = '';
              if (cell !== null && cell !== undefined) {
                val = cell.f !== undefined && cell.f !== null ? cell.f : (cell.v !== undefined ? cell.v : '');
              }
              obj[cols[index]] = val;
            });
          }
          return obj;
        });
        callback(rows);
      })
      .catch(err => console.error(`Gagal ambil data ${sheetName} via GViz:`, err));
  }
  
  // --- 3. FUNGSI BANTUAN COOLDOWN BUTANG (ELAK SPAM KLIK) ---
  function setButtonCooldown(buttonEl, durationInSeconds = 5, customText = "Sila tunggu") {
    if (!buttonEl) return;
    
    const btnId = buttonEl.id || 'btn_generic';
    const storageKey = `cooldown_expiry_${btnId}`;
    const now = Date.now();
    const savedExpiry = localStorage.getItem(storageKey);
    
    let remainingTime = durationInSeconds;
    
    if (savedExpiry && savedExpiry > now) {
      remainingTime = Math.ceil((savedExpiry - now) / 1000);
    } else {
      localStorage.setItem(storageKey, now + (durationInSeconds * 1000));
    }

    const originalHTML = buttonEl.getAttribute('data-original-html') || buttonEl.innerHTML;
    if (!buttonEl.hasAttribute('data-original-html')) {
      buttonEl.setAttribute('data-original-html', originalHTML);
    }
    
    buttonEl.disabled = true;
    buttonEl.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    buttonEl.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> ${customText} (${remainingTime}s)`;
    
    const countdownTimer = setInterval(() => {
      remainingTime--;
      if (remainingTime > 0) {
        buttonEl.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> ${customText} (${remainingTime}s)`;
      } else {
        clearInterval(countdownTimer);
        localStorage.removeItem(storageKey);
        buttonEl.disabled = false;
        buttonEl.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        buttonEl.innerHTML = buttonEl.getAttribute('data-original-html');
        
        if (buttonEl.id === 'btn-upload-gallery') {
          bindPhotoUploadListener();
        }
      }
    }, 1000);
  }

  // Semak semula cooldown yang aktif semasa pelayar dimuatkan
  setTimeout(() => {
    ['rsvp-submit', 'btn-upload-gallery', 'btn-submit-wish', 'refresh-wishes-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const savedExpiry = localStorage.getItem(`cooldown_expiry_${id}`);
        if (savedExpiry && savedExpiry > Date.now()) {
          const activeDuration = Math.ceil((savedExpiry - Date.now()) / 1000);
          const customTxt = id === 'btn-upload-gallery' ? 'Memuat Naik' : (id === 'refresh-wishes-btn' ? 'Memuat' : 'Sila tunggu');
          setButtonCooldown(btn, activeDuration, customTxt);
        }
      }
    });
  }, 300);

  // --- 4. FETCH SITE CONFIG (TETAPAN UTAMA LAMAN WEB) ---
  function fetchSiteConfig() {
    if (!SPREADSHEET_ID) return;
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;

    fetch(url)
      .then(res => res.text())
      .then(text => {
        const startIdx = text.indexOf('setResponse(');
        if (startIdx === -1) return;
        
        const jsonString = text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')'));
        const json = JSON.parse(jsonString);
        const rows = json.table.rows;
        
        let config = {};

        function extractCellVal(cell) {
          if (!cell) return '';
          if (cell.v !== undefined && cell.v !== null) {
            return cell.v;
          }
          return '';
        }

        rows.forEach(r => {
          if (!r || !r.c) return;
          
          const k1 = extractCellVal(r.c[0]);
          const v1 = extractCellVal(r.c[1]);
          if (k1 && typeof k1 === 'string' && k1.toLowerCase() !== 'key') {
            config[k1.trim().toLowerCase()] = v1;
          }

          const k2 = extractCellVal(r.c[5]);
          const v2 = extractCellVal(r.c[6]);
          if (k2 && typeof k2 === 'string' && k2.toLowerCase() !== 'key') {
            config[k2.trim().toLowerCase()] = v2;
          }
        });

        console.log("Config Berjaya Diparse:", config);

        // Ambil tempoh cooldown dari config
        window.rsvpCd = config.rsvp_cd ? parseInt(config.rsvp_cd) : 5;
        window.galleryCd = config.gallery_cd ? parseInt(config.gallery_cd) : 5;
        window.wishCd = config.wish_cd ? parseInt(config.wish_cd) : 5;
        window.wishManualCd = config.wish_manual_cd ? parseInt(config.wish_manual_cd) : 5;
        
        // Mesej sistem ucapan kosong (menyokong system_wish_info / wish_system_info)
        window.systemWishInfoMsg = config.system_wish_info || config.wish_system_info || "Titipkan sepotong doa, pesanan, atau hajat buat pengantin di ruangan di atas!";

        // Paparkan senarai ucapan awal selepas config ditarik
        renderWishes();

        // Pemetaan Maklumat Pengantin
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

        // Pemetaan Masa & Lokasi Majlis
        if (config.event_date && document.getElementById('dyn-event-date')) {
          document.getElementById('dyn-event-date').innerHTML = `<i class="far fa-calendar-alt text-purpleTheme-700 mr-2"></i> ${config.event_date}`;
        }
        if (config.event_time && document.getElementById('dyn-event-time')) {
          document.getElementById('dyn-event-time').innerHTML = `<i class="far fa-clock text-purpleTheme-700 mr-2"></i> ${config.event_time}`;
        }
        if (config.event_location && document.getElementById('dyn-event-location')) {
          document.getElementById('dyn-event-location').innerHTML = `<i class="fas fa-map-marker-alt text-purpleTheme-700 mr-2"></i> ${config.event_location}`;
        }
		
        // Pautan Google Maps
        const gmapsLink = document.getElementById('dyn-gmaps-link');
        if (gmapsLink) {
          const gmapsUrl = config.gmaps_url ? String(config.gmaps_url).trim() : '#';
          gmapsLink.href = gmapsUrl;
          gmapsLink.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (gmapsUrl && gmapsUrl !== '#') window.open(gmapsUrl, '_blank');
          };
        }

        // Pautan Waze
        const wazeLink = document.getElementById('dyn-waze-link');
        if (wazeLink) {
          const wazeUrl = config.waze_url ? String(config.waze_url).trim() : '#';
          wazeLink.href = wazeUrl;
          wazeLink.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wazeUrl && wazeUrl !== '#') window.open(wazeUrl, '_blank');
          };
        }

        // Pemetaan Kontak 1
        if (config.contact1_name && document.getElementById('dyn-c1-name')) {
          document.getElementById('dyn-c1-name').innerText = config.contact1_name;
          document.getElementById('dyn-c1-rel').innerText = config.contact1_relation || '';
          
          const phone1 = config.contact1_phone ? String(config.contact1_phone).replace(/[^0-9+]/g, '') : '';
          const telBtn1 = document.getElementById('dyn-c1-tel');
          const waBtn1 = document.getElementById('dyn-c1-wa');
          
          if (telBtn1) {
            telBtn1.href = phone1 ? `tel:${phone1}` : '#';
            telBtn1.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (phone1) window.location.href = telBtn1.href; };
          }
          if (waBtn1) {
            const waUrl = phone1 ? `https://wa.me/${phone1}?text=Assalamualaikum` : '#';
            waBtn1.href = waUrl;
            waBtn1.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (phone1) window.open(waUrl, '_blank'); };
          }
        }

        // Pemetaan Kontak 2
        if (config.contact2_name && document.getElementById('dyn-c2-name')) {
          document.getElementById('dyn-c2-name').innerText = config.contact2_name;
          document.getElementById('dyn-c2-rel').innerText = config.contact2_relation || '';
          
          const phone2 = config.contact2_phone ? String(config.contact2_phone).replace(/[^0-9+]/g, '') : '';
          const telBtn2 = document.getElementById('dyn-c2-tel');
          const waBtn2 = document.getElementById('dyn-c2-wa');
          
          if (telBtn2) {
            telBtn2.href = phone2 ? `tel:${phone2}` : '#';
            telBtn2.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (phone2) window.location.href = telBtn2.href; };
          }
          if (waBtn2) {
            const waUrl2 = phone2 ? `https://wa.me/${phone2}?text=Assalamualaikum` : '#';
            waBtn2.href = waUrl2;
            waBtn2.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (phone2) window.open(waUrl2, '_blank'); };
          }
        }

        // Maksimum Bilangan Pax RSVP
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

        // Kawalan Master Switch: RSVP
        const rsvpFormEl = document.getElementById('rsvp-form');
        const rsvpNameInput = document.getElementById('rsvp-name');
        const rsvpPhoneInput = document.getElementById('rsvp-phone');
        const rsvpStatusInput = document.getElementById('rsvp-status');
        const rsvpSubmitBtn = rsvpFormEl ? rsvpFormEl.querySelector('button[type="submit"]') : null;

        if (config.control_rsvp !== undefined) {
          const isRsvpActive = config.control_rsvp === true || String(config.control_rsvp).trim().toUpperCase() === 'TRUE';
          if (!isRsvpActive) {
            if (rsvpSubmitBtn) {
              rsvpSubmitBtn.disabled = true;
              rsvpSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              rsvpSubmitBtn.innerText = "RSVP DITUTUP";
            }
            if (rsvpNameInput) rsvpNameInput.disabled = true;
            if (rsvpPhoneInput) rsvpPhoneInput.disabled = true;
            if (rsvpStatusInput) rsvpStatusInput.disabled = true;
            if (paxSelect) paxSelect.disabled = true;
          }
        }

        // Kawalan Master Switch: Galeri
        const uploadBtn = document.getElementById('btn-upload-gallery');
        if (uploadBtn && config.control_gallery !== undefined) {
          const isGalleryActive = config.control_gallery === true || String(config.control_gallery).trim().toUpperCase() === 'TRUE';
          const photoInput = document.getElementById('photo-upload');
          
          if (!isGalleryActive) {
            uploadBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
            uploadBtn.innerHTML = `<i class="fas fa-lock text-base"></i> Muat Naik Ditutup`;
            if (photoInput) photoInput.disabled = true;
          } else {
            uploadBtn.classList.remove('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
            uploadBtn.innerHTML = `<i class="fas fa-cloud-upload-alt text-base"></i> Muat Naik Gambar <input type="file" id="photo-upload" accept="image/*" class="hidden">`;
            bindPhotoUploadListener();
          }
        }

        // Kawalan Master Switch: Ucapan (Wishes)
        const wishSubmitBtn = document.getElementById('btn-submit-wish');
        const wishNameInput = document.getElementById('wish-name');
        const wishMsgInput = document.getElementById('wish-message');

        if (config.control_wish !== undefined) {
          const isWishActive = config.control_wish === true || String(config.control_wish).trim().toUpperCase() === 'TRUE';
          if (!isWishActive) {
            if (wishSubmitBtn) {
              wishSubmitBtn.disabled = true;
              wishSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              wishSubmitBtn.innerText = "UCAPAN DITUTUP";
            }
            if (wishNameInput) wishNameInput.disabled = true;
            if (wishMsgInput) wishMsgInput.disabled = true;
          }
        }

        applySiteConfig(config);
      })
      .catch(err => console.error("Gagal ambil Config:", err));
  }
  
  // Pelaksanaan fungsi secara berperingkat apabila laman dibuka
  setTimeout(() => { fetchSiteConfig(); }, 200);
  setTimeout(() => { fetchTentative(); }, 600);
  setTimeout(() => { fetchGalleryImages(); }, 1000);
  setTimeout(() => { fetchWishes(); }, 1400);
  
  // --- 5. TENTATIVE MAJLIS ---
  function fetchTentative() {
    if (!SPREADSHEET_ID) return;
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Tentative`;

    fetch(url)
      .then(res => res.text())
      .then(text => {
        const startIdx = text.indexOf('setResponse(');
        if (startIdx === -1) return;
        
        const jsonString = text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')'));
        const json = JSON.parse(jsonString);
        const rows = json.table.rows;

        const container = document.getElementById('dyn-tentative-container');
        const scrollBox = document.getElementById('tentative-scroll-box');
        const scrollIndicator = document.getElementById('tentative-scroll-indicator');

        if (!container) return;

        if (rows && rows.length > 0) {
          container.innerHTML = rows.map(row => {
            if (!row || !row.c) return '';
            
            const cellTime = row.c[0];
            const cellDesc = row.c[1];

            let rawTime = '';
            if (cellTime && cellTime.v !== undefined && cellTime.v !== null) {
              rawTime = String(cellTime.v);
            }

            let displayTime = rawTime;
            if (rawTime.startsWith('Date(')) {
              const nums = rawTime.match(/\d+/g);
              if (nums && nums.length >= 5) {
                let hour = parseInt(nums[3], 10);
                let minute = parseInt(nums[4], 10);
                let ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                let minStr = minute < 10 ? '0' + minute : minute;
                displayTime = `${hour}:${minStr} ${ampm}`;
              }
            }

            let description = cellDesc && cellDesc.v !== undefined && cellDesc.v !== null ? String(cellDesc.v) : '';
            if (!displayTime && !description) return '';

            return `
              <div class="relative">
                <span class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-purpleTheme-700 border-2 border-white"></span>
                <span class="text-xs font-semibold text-purpleTheme-700 bg-butter-100 px-2 py-0.5 rounded">${displayTime}</span>
                <p class="text-sm font-medium text-purpleTheme-900 mt-1">${description}</p>
              </div>
            `;
          }).join('');

          if (scrollBox && scrollIndicator) {
            scrollIndicator.classList.toggle('hidden', scrollBox.scrollHeight <= scrollBox.clientHeight);
            scrollBox.addEventListener('scroll', () => {
              scrollIndicator.style.opacity = (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 10) ? '0' : '1';
            });
          }
        } else {
          container.innerHTML = `<p class="text-xs text-purpleTheme-700/60 italic">Akan dikemaskini.</p>`;
          if (scrollIndicator) scrollIndicator.classList.add('hidden');
        }
      })
      .catch(err => console.error("Gagal ambil Tentative:", err));
  }

  // --- 6. RSVP STATUS & PAX TOGGLE ---
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
  
  // --- 7. SMOOTH SCROLL UNTUK PAUTAN TEMPATAN ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      e.preventDefault();
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
  
  // --- 8. AUDIO & MUZIK LATAR BELAKANG ---
  const bgMusic = document.getElementById('bg-music');
  const heroOpenBtn = document.getElementById('hero-open-btn');
  let isPlaying = false;
  let hasInteracted = false;

  const dockMusicBtn = document.getElementById('dock-music-btn');
  const dockMusicIcon = document.getElementById('dock-music-icon');
  const dockMusicText = document.getElementById('dock-music-text');

  function updateDockMusicUI() {
    if (isPlaying) {
      if (dockMusicIcon) dockMusicIcon.className = 'fas fa-volume-high text-purpleTheme-700 group-hover:scale-110 transition-transform';
      if (dockMusicText) dockMusicText.textContent = 'Musik';
      if (dockMusicBtn) {
        dockMusicBtn.classList.remove('text-purpleTheme-900/60');
        dockMusicBtn.classList.add('text-purpleTheme-900');
      }
    } else {
      if (dockMusicIcon) dockMusicIcon.className = 'fas fa-volume-xmark text-purpleTheme-900/60 group-hover:scale-110 transition-transform';
      if (dockMusicText) dockMusicText.textContent = 'Musik';
      if (dockMusicBtn) {
        dockMusicBtn.classList.remove('text-purpleTheme-900');
        dockMusicBtn.classList.add('text-purpleTheme-900/60');
      }
    }
  }

  function playAudioTrack() {
    if (bgMusic) {
      bgMusic.play().then(() => {
        isPlaying = true;
        hasInteracted = true;
        updateDockMusicUI();
      }).catch((error) => {
        console.log("Autoplay disekat oleh pelayar:", error);
        isPlaying = false;
        updateDockMusicUI();
      });
    }
  }

  function pauseAudioTrack() {
    if (bgMusic) {
      bgMusic.pause();
      isPlaying = false;
      updateDockMusicUI();
    }
  }

  if (heroOpenBtn) {
    heroOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isPlaying ? pauseAudioTrack() : playAudioTrack();
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
  
  if (dockMusicBtn && bgMusic) {
    dockMusicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPlaying ? pauseAudioTrack() : playAudioTrack();
      hasInteracted = true;
    });
  }

  // --- 9. COUNTDOWN TIMER ---
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

  // --- 10. IMPORT KE KALENDAR (.ICS) ---
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
  
  // --- 11. SISTEM MODAL PENGESAHAN KUSTOM (CUSTOM CONFIRM DIALOG) ---
  const confirmModal = document.getElementById('custom-confirm-modal');
  const confirmTitle = document.getElementById('custom-modal-title');
  const confirmDesc = document.getElementById('custom-modal-desc');
  const dialogYesBtn = document.getElementById('modal-btn-yes');
  const dialogCancelBtn = document.getElementById('modal-btn-no');
  const modalIconBox = document.getElementById('modal-icon-box');
  const modalIconClass = document.getElementById('modal-icon-class');
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

  function showConfirmDialog(title, desc, onConfirm, isAlertOnly = false, iconType = 'question') {
    if (!confirmModal) {
      onConfirm();
      return;
    }

    if (confirmTitle) confirmTitle.innerText = title;
    if (confirmDesc) confirmDesc.innerText = desc;
    currentConfirmCallback = onConfirm;

    if (isAlertOnly) {
      if (dialogCancelBtn) dialogCancelBtn.classList.add('hidden');
      if (dialogYesBtn) {
        dialogYesBtn.className = "w-full py-3.5 rounded-xl bg-purpleTheme-900 hover:bg-purpleTheme-800 text-butter-100 text-xs font-semibold tracking-wider uppercase shadow-md transition-all cursor-pointer";
        dialogYesBtn.innerText = "FAHAM";
      }
    } else {
      if (dialogCancelBtn) dialogCancelBtn.classList.remove('hidden');
      if (dialogYesBtn) {
        dialogYesBtn.className = "w-1/2 py-3.5 rounded-xl bg-purpleTheme-900 hover:bg-purpleTheme-800 text-butter-100 text-xs font-semibold tracking-wider uppercase shadow-md transition-all cursor-pointer";
        dialogYesBtn.innerText = "YA, PASTI";
      }
    }

    if (modalIconBox && modalIconClass) {
      if (iconType === 'error') {
        modalIconBox.className = "w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-2xl mb-1 shadow-sm transition-transform duration-300 hover:scale-110";
        modalIconClass.className = "fas fa-times animate-pulse";
      } else {
        modalIconBox.className = "w-14 h-14 rounded-full bg-butter-200 text-purpleTheme-700 mx-auto flex items-center justify-center text-xl mb-1 shadow-sm transition-transform duration-300 hover:scale-110";
        modalIconClass.className = "fas fa-question-circle";
      }
    }

    confirmModal.classList.remove('hidden');
  }

  // --- 12. BORANG PENGESAHAN KEHADIRAN (RSVP SUBMIT) ---
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      showConfirmDialog(
        "Hantar Pengesahan RSVP?",
        "Adakah anda pasti maklumat kehadiran yang dimasukkan sudah betul?",
        () => {
          const submitBtn = document.getElementById('rsvp-submit');
          setButtonCooldown(submitBtn, window.rsvpCd || 5, "Sila tunggu");

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
            if (alertBox) {
              if (data.status === "error") {
                alertBox.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}`;
              } else {
                alertBox.innerHTML = `<i class="fas fa-check-circle text-purpleTheme-700 text-lg mr-2"></i> Terima kasih! Pengesahan RSVP anda telah berjaya disimpan.`;
                rsvpForm.reset();
                if (paxContainer) paxContainer.classList.remove('hidden');
                if (rsvpPax) rsvpPax.value = "1";
              }
              alertBox.classList.remove('hidden');
              setTimeout(() => { alertBox.classList.add('hidden'); }, 5000);
            }
          })
          .catch(error => console.error('RSVP Error:', error));
        }
      );
    });
  }
  
  // --- 13. GALERI & SLIDESHOW GAMBAR ---
  const fallbackGallery = [{ url: "images/Coming-Soon.jpg", caption: "Detik Manis Bersama Bermula Disini..." }];
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
      photoUpload.removeEventListener('change', handlePhotoUploadChange);
      photoUpload.addEventListener('change', handlePhotoUploadChange);
    }
  }

  function handlePhotoUploadChange(event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        event.target.value = '';
        showConfirmDialog("Format Tidak Sah", "Hanya fail gambar sahaja dibenarkan!", () => {}, true, 'error');
        return;
      }
      selectedFileForUpload = file;
      if (uploaderNameInput) uploaderNameInput.value = '';
      if (imageCaptionInput) imageCaptionInput.value = '';
      if (uploadModal) uploadModal.classList.remove('hidden');
    }
  }

  function fetchGalleryImages() {
    fetchSheetDataViaGViz('Gallery', function(data) {
      if (data && data.length > 0) {
        const newGallery = data.map(item => ({
          url: item.url || item.URL || '',
          caption: `${item.caption || item.kapsyen || 'Kenangan'} (Oleh: ${item.name || item.nama || 'Tetamu'})`
        })).filter(img => img.url !== '');

        if (newGallery.length > 0 && JSON.stringify(newGallery) !== JSON.stringify(defaultGallery)) {
          defaultGallery = newGallery;
          isUsingFallback = false;
          currentSlide = 0;
          renderSlide();
        } else if (newGallery.length === 0 && !isUsingFallback) {
          defaultGallery = [...fallbackGallery];
          isUsingFallback = true;
          currentSlide = 0;
          renderSlide();
        }
      } else {
        if (!isUsingFallback) {
          defaultGallery = [...fallbackGallery];
          isUsingFallback = true;
          currentSlide = 0;
          renderSlide();
        }
      }
    });
  }

  function renderSlide() {
    if (!slideImg || !slideCaption || defaultGallery.length === 0) return;
    if (slideTimer) clearTimeout(slideTimer);
    if (currentSlide >= defaultGallery.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = defaultGallery.length - 1;

    slideImg.style.opacity = '0.3';
    setTimeout(() => {
      slideImg.src = defaultGallery[currentSlide].url;
      slideCaption.innerText = defaultGallery[currentSlide].caption;
      slideImg.style.opacity = '1';
    }, 200);

    slideTimer = setTimeout(() => {
      currentSlide = (currentSlide + 1) % defaultGallery.length;
      renderSlide();
    }, 10000);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => { currentSlide = (currentSlide - 1 + defaultGallery.length) % defaultGallery.length; renderSlide(); });
    nextBtn.addEventListener('click', () => { currentSlide = (currentSlide + 1) % defaultGallery.length; renderSlide(); });
  }

  function closeUploadModal() {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFileForUpload = null;
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) photoUpload.value = '';
    bindPhotoUploadListener();
  }

  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);
  bindPhotoUploadListener();

  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', () => {
      if (!selectedFileForUpload) return;
      
      const uploaderName = uploaderNameInput.value.trim();
      const imageCaption = imageCaptionInput.value.trim();

      if (!uploaderName || !imageCaption) {
        showConfirmDialog("Maklumat Tidak Lengkap", "Sila masukkan Nama Anda dan Kapsyen Gambar!", () => {}, true, 'error');
        return;
      }

      if (uploadModal) uploadModal.classList.add('hidden');

      showConfirmDialog(
        "Muat Naik Gambar?",
        "Adakah anda pasti mahu memuat naik gambar ini?",
        () => {
          const uploadBtnMain = document.getElementById('btn-upload-gallery');
          setButtonCooldown(uploadBtnMain, window.galleryCd || 5, "Memuat Naik");
          const galleryAlert = document.getElementById('gallery-alert');

          if (galleryAlert) {
            galleryAlert.innerHTML = `<i class="fas fa-spinner fa-spin text-purpleTheme-700 text-lg mr-2"></i> Sedang memproses gambar...`;
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

              const base64String = canvas.toDataURL('image/jpeg', 1.0).split(',')[1];
              const formData = new URLSearchParams();
              formData.append('action', 'gallery');
              formData.append('fileName', selectedFileForUpload.name.replace(/\.[^/.]+$/, "") + ".jpg");
              formData.append('mimeType', 'image/jpeg');
              formData.append('fileData', base64String);
              formData.append('name', uploaderName);
              formData.append('caption', imageCaption);
              
              fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
              .then(res => res.json())
              .then(data => {
                if (galleryAlert) {
                  galleryAlert.innerHTML = data.status === "error" ? `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}` : `<i class="fas fa-check-circle text-purpleTheme-700 text-lg mr-2"></i> Berjaya! Terima Kasih.`;
                  setTimeout(() => galleryAlert.classList.add('hidden'), 5000);
                }
                closeUploadModal();
                fetchGalleryImages();
              })
              .catch(err => { console.error('Upload error:', err); closeUploadModal(); });
            };
          };
          reader.readAsDataURL(selectedFileForUpload);
        }
      );
    });
  }

  // --- 14. BUKU HAJAT & UCAPAN (WISHES SYSTEM) ---
  let defaultWishes = [];
  window.systemWishInfoMsg = "Titipkan sepotong doa, pesanan, atau hajat buat pengantin di ruangan di atas!";

  function formatSubmitTime(timestamp) {
    if (!timestamp) return "";
    let date = typeof timestamp === 'string' ? new Date(timestamp.replace(/-/g, "/")) : new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp; 

    return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function renderWishes() {
    const container = document.getElementById('wishes-container');
    if (!container) return;

    if (!defaultWishes || defaultWishes.length === 0) {
      container.innerHTML = `
        <div class="bg-white/85 backdrop-blur-sm rounded-2xl p-6 text-center border border-purpleTheme-100 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-full bg-butter-200 text-purpleTheme-700 mx-auto flex items-center justify-center text-sm mb-1 shadow-sm">
            <i class="fas fa-heart"></i>
          </div>
          <h4 class="font-serif font-semibold text-purpleTheme-900 text-sm sm:text-base">Belum Ada Ucapan</h4>
          <p class="text-xs text-purpleTheme-800/70 font-light">${window.systemWishInfoMsg}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = defaultWishes.map(w => `
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purpleTheme-100 shadow-sm space-y-1.5 transition-all">
        <div class="flex items-center justify-between border-b border-purpleTheme-50 pb-1.5">
          <h4 class="font-serif font-semibold text-purpleTheme-900 text-sm sm:text-base">${w.name}</h4>
          <span class="text-[10px] text-purpleTheme-700/60 font-light">${formatSubmitTime(w.timestamp)}</span>
        </div>
        <p class="text-xs sm:text-sm text-purpleTheme-800/90 leading-relaxed font-light whitespace-pre-line break-words">${w.message}</p>
      </div>
    `).join('');
  }

  renderWishes(); // Papar mesej kosong awal

  function fetchWishes() {
    fetchSheetDataViaGViz('Wishes', function(data) {
      if (data && data.length > 0) {
        defaultWishes = data.map(item => ({ 
          name: (item.name || item.nama || '').trim(), 
          message: (item.message || item.ucapan || '').trim(), 
          timestamp: item.timestamp || item.masa || '' 
        })).filter(w => w.name !== '' && w.message !== '').reverse();
      } else {
        defaultWishes = [];
      }
      renderWishes();
    });
  }

  const refreshWishesBtn = document.getElementById('refresh-wishes-btn');
  if (refreshWishesBtn) {
    refreshWishesBtn.addEventListener('click', () => {
      setButtonCooldown(refreshWishesBtn, window.wishManualCd || 5, "Memuat");
      fetchWishes();
    });
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
          "Adakah anda pasti mahu menghantar ucapan ini?",
          () => {
            const submitBtn = document.getElementById('btn-submit-wish');
            setButtonCooldown(submitBtn, window.wishCd || 5, "Sila tunggu");

            const formData = new URLSearchParams();
            formData.append('action', 'wishes');
            formData.append('name', nameInput.value);
            formData.append('message', msgInput.value);
            
            fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
            .then(res => res.json())
            .then(data => {
              const wishAlert = document.getElementById('wish-alert');
              if (wishAlert) {
                wishAlert.innerHTML = data.status === "error" ? `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}` : `Terima kasih! Ucapan dan doa restu anda telah berjaya direkodkan. 🤍`;
                wishAlert.classList.remove('hidden');
                setTimeout(() => { wishAlert.classList.add('hidden'); }, 5000);
              }
              if (data.status !== "error") {
                nameInput.value = ''; 
                msgInput.value = '';
                fetchWishes();
              }
            })
            .catch(err => console.error('Wish Error:', err));
          }
        );
      }
    });
  }

  // --- 15. LIGHTBOX MODAL UNTUK GAMBAR GALERI ---
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

  // --- 16. FLOATING ACTION BUTTON (FAB) & NAVIGASI ---
  const fabContainer = document.getElementById('fab-container');
  const fabTrigger = document.getElementById('fab-trigger');
  const fabDock = document.getElementById('fab-dock');
  const fabLinks = document.querySelectorAll('.fab-link');
  const moreMenuBtn = document.getElementById('more-menu-btn');
  const morePopover = document.getElementById('more-popover');
  const sections = document.querySelectorAll('section[id]');
  
  let isOpen = false;
  let lastScrollY = window.scrollY;
  let closeTimer = null;
  let scrollTimeout = null;

  function updateActiveSection() {
    let scrollPosition = window.scrollY + window.innerHeight / 3;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        fabLinks.forEach(link => {
          if (link.getAttribute('data-target') === sectionId) {
            link.classList.remove('text-purpleTheme-900/60');
            link.classList.add('text-purpleTheme-900', 'font-bold', 'scale-110');
          } else {
            link.classList.remove('text-purpleTheme-900', 'font-bold', 'scale-110');
            link.classList.add('text-purpleTheme-900/60');
          }
        });
      }
    });
  }

  function resetCloseTimer() {
    if (closeTimer) clearTimeout(closeTimer);
    if (isOpen) closeTimer = setTimeout(closeDock, 5000);
  }

  function resetScrollTimeout() {
    clearTimeout(scrollTimeout);
    if (!isOpen && window.scrollY > 300) {
      scrollTimeout = setTimeout(() => {
        if (!isOpen && window.scrollY > 300 && fabContainer) {
          fabContainer.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
          fabContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        }
      }, 3500);
    }
  }

  window.addEventListener('scroll', () => {
    let currentScrollY = window.scrollY;
    updateActiveSection();

    if (currentScrollY > 300) {
      if (fabContainer) {
        fabContainer.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        fabContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      }
      if (isOpen && Math.abs(currentScrollY - lastScrollY) > 40) closeDock();
      resetScrollTimeout();
    } else {
      if (fabContainer) {
        fabContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        fabContainer.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      }
      closeDock();
    }
    lastScrollY = currentScrollY;
  });
  
  function openDock() {
    isOpen = true;
    if (fabContainer) {
      fabContainer.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
      fabContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    }
    if (fabDock) {
      fabDock.classList.remove('scale-75', 'opacity-0', 'pointer-events-none');
      fabDock.classList.add('scale-100', 'opacity-100', 'pointer-events-auto');
    }
    resetCloseTimer();
  }
	
  function closeDock() {
    isOpen = false;
    if (closeTimer) clearTimeout(closeTimer);
    if (fabDock) {
      fabDock.classList.add('scale-75', 'opacity-0', 'pointer-events-none');
      fabDock.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto');
    }
    if (window.scrollY > 300 && fabContainer) {
      fabContainer.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      fabContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    }
    if (morePopover) {
      morePopover.classList.add('hidden');
      morePopover.classList.remove('flex');
    }
    resetScrollTimeout();
  }

  if (fabTrigger) {
    fabTrigger.addEventListener('click', (e) => { e.stopPropagation(); isOpen ? closeDock() : openDock(); });
  }

  if (moreMenuBtn && morePopover) {
    moreMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      morePopover.classList.toggle('hidden');
      morePopover.classList.toggle('flex');
      resetCloseTimer();
    });
  }

  window.addEventListener('click', (e) => {
    if (morePopover && moreMenuBtn && !moreMenuBtn.contains(e.target) && !morePopover.contains(e.target)) {
      morePopover.classList.add('hidden');
      morePopover.classList.remove('flex');
    }
    if (isOpen && fabContainer && fabDock && !fabContainer.contains(e.target) && !fabDock.contains(e.target)) {
      closeDock();
    } else if (isOpen) {
      resetCloseTimer();
    }
  });

  fabLinks.forEach(link => { link.addEventListener('click', closeDock); });
  updateActiveSection();
  
  // --- 17. MODAL HADIAH / SALAM KASIH & COPY CLIPBOARD ---
  const giftModal = document.getElementById('gift-modal');
  const dockGiftBtn = document.getElementById('dock-gift-btn');
  const popoverGiftBtn = document.getElementById('popover-gift-btn');
  const closeGiftModalBtn = document.getElementById('close-gift-modal');
  const btnCloseGift = document.getElementById('btn-close-gift');

  function openGiftModal() { if (giftModal) giftModal.classList.remove('hidden'); closeDock(); }
  function closeGiftModal() { if (giftModal) giftModal.classList.add('hidden'); }

  if (dockGiftBtn) dockGiftBtn.addEventListener('click', (e) => { e.stopPropagation(); openGiftModal(); });
  if (popoverGiftBtn) popoverGiftBtn.addEventListener('click', (e) => { e.stopPropagation(); openGiftModal(); });
  if (closeGiftModalBtn) closeGiftModalBtn.addEventListener('click', closeGiftModal);
  if (btnCloseGift) btnCloseGift.addEventListener('click', closeGiftModal);

  if (giftModal) {
    giftModal.addEventListener('click', (e) => { if (e.target === giftModal) closeGiftModal(); });
  }

  window.copyToClipboard = function(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `<i class="fas fa-check text-xs"></i> <span>Berjaya!</span>`;
      btnElement.classList.add('bg-emerald-500', 'text-white');
      btnElement.classList.remove('bg-butter-200', 'hover:bg-butter-300', 'text-purpleTheme-900');
      
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.classList.remove('bg-emerald-500', 'text-white');
        btnElement.classList.add('bg-butter-200', 'hover:bg-butter-300', 'text-purpleTheme-900');
      }, 2000);
    }).catch(err => console.error('Gagal menyalin teks:', err));
  };
  
  // --- 18. APLIKASI CONFIG TAMBAHAN (BANK, QR, ALAMAT, HADIAH) ---
  function applySiteConfig(config) {
    // Kawalan Hadiah / Salam Kasih
    const giftControl = config.control_gift;
    const dockGiftBtnEl = document.getElementById('dock-gift-btn');
    if (dockGiftBtnEl) {
      dockGiftBtnEl.style.display = (giftControl === false || String(giftControl).trim().toUpperCase() === "FALSE") ? 'none' : 'flex';
    }

    // Kawalan Bank
    const bankSection = document.getElementById('bank-section');
    const bankControl = config.control_bank;
    if (bankSection) {
      if (bankControl === false || String(bankControl).trim().toUpperCase() === "FALSE") {
        bankSection.style.display = 'none';
      } else {
        bankSection.style.display = 'block';
        document.getElementById('bank-name').innerText = config.bank_name || '';
        document.getElementById('bank-holder').innerText = config.bank_holder || '';
        document.getElementById('bank-account').innerText = config.bank_account || '';
      }
    }

    // Kawalan QR Code
    const qrSection = document.getElementById('qr-section');
    const qrControl = config.control_qr;
    if (qrSection) {
      if (qrControl === false || String(qrControl).trim().toUpperCase() === "FALSE") {
        qrSection.style.display = 'none';
      } else {
        qrSection.style.display = 'block';
        const qrImg = document.getElementById('dyn-qr-image') || document.getElementById('qr-image');
        if (qrImg) {
          const rawInput = config.qr_image_url ? String(config.qr_image_url).trim() : '';
          let fileId = rawInput;

          if (rawInput.includes('drive.google.com')) {
            const match1 = rawInput.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            const match2 = rawInput.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match1 && match1[1]) fileId = match1[1];
            else if (match2 && match2[1]) fileId = match2[1];
          }

          if (fileId) {
            const targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            qrImg.src = `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}`;
          } else {
            qrImg.src = '';
          }
        }
      }
    }

    // Kawalan Alamat Fizikal
    const addressSection = document.getElementById('address-section');
    const addressControl = config.control_address;
    if (addressSection) {
      if (addressControl === false || String(addressControl).trim().toUpperCase() === "FALSE") {
        addressSection.style.display = 'none';
      } else {
        addressSection.style.display = 'block';
        document.getElementById('gift-address').innerText = config.gift_address || '';
      }
    }
  }

});