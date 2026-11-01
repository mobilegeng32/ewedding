/**
 * =================================================================
 * DIGITAL WEDDING INVITATION - ULTIMATE MASTER SCRIPT (FIXED v2.62)
 * =================================================================
 */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwC0NCpQLF2bq629RZsFuIiddVUWCQlG-jknzv3zLCwYPIIrv_lhiKNeabYte7azNFc/exec';
  const SPREADSHEET_ID = '1JGP59v8YPvFqp64lUHgaVfdxKUZ5x8S4Mu_ujcxNsyI'; 
  
  // --- 1. FUNGSI BANTUAN GVIZ ---
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
  
  // --- 2. FUNGSI COOLDOWN BUTANG ---
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
      }
    }, 1000);
  }

  setTimeout(() => {
    ['rsvp-submit', 'btn-upload-gallery', 'btn-submit-wish'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const savedExpiry = localStorage.getItem(`cooldown_expiry_${id}`);
        if (savedExpiry && savedExpiry > Date.now()) {
          const activeDuration = Math.ceil((savedExpiry - Date.now()) / 1000);
          const customTxt = id === 'btn-upload-gallery' ? 'Memuat Naik' : 'Sila tunggu';
          setButtonCooldown(btn, activeDuration, customTxt);
        }
      }
    });
  }, 300);

  // --- 3. FETCH SITE CONFIG (CONFIG AWAL & KAWALAN BUTANG LIVE) ---
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
          if (cell.v !== undefined && cell.v !== null) return cell.v;
          return '';
        }

        rows.forEach(r => {
          if (!r || !r.c) return;
          const k1 = extractCellVal(r.c[0]);
          const v1 = extractCellVal(r.c[1]);
          if (k1 && typeof k1 === 'string' && k1.toLowerCase() !== 'key') {
            config[k1.trim().toLowerCase()] = v1;
            config[k1.trim()] = v1;
          }

          const k2 = extractCellVal(r.c[5]);
          const v2 = extractCellVal(r.c[6]);
          if (k2 && typeof k2 === 'string' && k2.toLowerCase() !== 'key') {
            config[k2.trim().toLowerCase()] = v2;
            config[k2.trim()] = v2;
          }
        });

        window.rsvpCd = config.rsvp_cd ? parseInt(config.rsvp_cd) : 5;
        window.galleryCd = config.gallery_cd ? parseInt(config.gallery_cd) : 5;
        window.wishCd = config.wish_cd ? parseInt(config.wish_cd) : 5;
        window.galleryQuotaLimit = config.gallery_limit ? parseInt(config.gallery_limit) : 20;
        window.systemWishInfoMsg = config.system_wish_info || config.wish_system_info || "Titipkan sepotong doa, pesanan, atau hajat buat pengantin di ruangan di atas!";

        renderWishes();

        if (config.bride_fullname && document.getElementById('dyn-bride-fullname')) document.getElementById('dyn-bride-fullname').innerText = config.bride_fullname;
        if (config.bride_desc && document.getElementById('dyn-bride-desc')) document.getElementById('dyn-bride-desc').innerText = config.bride_desc;
        if (config.groom_fullname && document.getElementById('dyn-groom-fullname')) document.getElementById('dyn-groom-fullname').innerText = config.groom_fullname;
        if (config.groom_desc && document.getElementById('dyn-groom-desc')) document.getElementById('dyn-groom-desc').innerText = config.groom_desc;

        if (config.event_date && document.getElementById('dyn-event-date')) document.getElementById('dyn-event-date').innerHTML = `<i class="far fa-calendar-alt text-purpleTheme-700 mr-2"></i> ${config.event_date}`;
        if (config.event_time && document.getElementById('dyn-event-time')) document.getElementById('dyn-event-time').innerHTML = `<i class="far fa-clock text-purpleTheme-700 mr-2"></i> ${config.event_time}`;
        if (config.event_location && document.getElementById('dyn-event-location')) document.getElementById('dyn-event-location').innerHTML = `<i class="fas fa-map-marker-alt text-purpleTheme-700 mr-2"></i> ${config.event_location}`;
		
        const gmapsLink = document.getElementById('dyn-gmaps-link');
        if (gmapsLink && config.gmaps_url) { gmapsLink.href = config.gmaps_url; gmapsLink.onclick = (e) => { e.preventDefault(); window.open(config.gmaps_url, '_blank'); }; }

        const wazeLink = document.getElementById('dyn-waze-link');
        if (wazeLink && config.waze_url) { wazeLink.href = config.waze_url; wazeLink.onclick = (e) => { e.preventDefault(); window.open(config.waze_url, '_blank'); }; }

        if (config.contact1_name && document.getElementById('dyn-c1-name')) {
          document.getElementById('dyn-c1-name').innerText = config.contact1_name;
          document.getElementById('dyn-c1-rel').innerText = config.contact1_rel || '';
          document.getElementById('dyn-c1-tel').href = `tel:${config.contact1_phone || ''}`;
          document.getElementById('dyn-c1-wa').href = `https://wa.me/${(config.contact1_phone || '').replace(/[^0-9]/g, '')}`;
        }
        if (config.contact2_name && document.getElementById('dyn-c2-name')) {
          document.getElementById('dyn-c2-name').innerText = config.contact2_name;
          document.getElementById('dyn-c2-rel').innerText = config.contact2_rel || '';
          document.getElementById('dyn-c2-tel').href = `tel:${config.contact2_phone || ''}`;
          document.getElementById('dyn-c2-wa').href = `https://wa.me/${(config.contact2_phone || '').replace(/[^0-9]/g, '')}`;
        }

        const maxPax = parseInt(config.max_pax) || 5;
        const paxSelect = document.getElementById('rsvp-pax');
        if (paxSelect) {
          paxSelect.innerHTML = ''; 
          for (let i = 1; i <= maxPax; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = `${i} Orang`;
            paxSelect.appendChild(opt);
          }
        }

        applySiteConfig(config);
      })
      .catch(err => console.error("Gagal ambil Config:", err));
  }

  setTimeout(fetchSiteConfig, 200);
  setTimeout(fetchTentative, 600);
  setTimeout(fetchGalleryImages, 1000);
  setTimeout(fetchWishes, 1400);

  // --- 4. TENTATIVE ---
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
            if (cellTime && cellTime.v !== undefined && cellTime.v !== null) rawTime = String(cellTime.v);

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

  // --- 5. RSVP STATUS & PAX TOGGLE ---
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

  // --- 6. SMOOTH SCROLL & FLOATING DOCK LOGIC (BEHAVIOR ASAL) ---
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
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

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
        fabContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        fabContainer.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
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

  // --- 7. AUDIO & MUZIK LATAR BELAKANG ---
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
      }).catch(() => {
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

      // Trigger buka dock sebentar supaya tetamu nampak kedudukan butang FAB
      setTimeout(() => {
        if (typeof openDock === 'function') openDock();
      }, 600);
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

  // --- 8. COUNTDOWN TIMER ---
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

  // --- 9. IMPORT KE KALENDAR (.ICS) & GIFT MODAL LOGIC ---
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

  const giftModal = document.getElementById('gift-modal');
  const dockGiftBtn = document.getElementById('dock-gift-btn');
  const popoverGiftBtn = document.getElementById('popover-gift-btn');
  const closeGiftModalBtn = document.getElementById('close-gift-modal');
  const btnCloseGift = document.getElementById('btn-close-gift');

  function openGiftModal() {
    if (giftModal) giftModal.classList.remove('hidden');
    if (morePopover) morePopover.classList.add('hidden');
    closeDock();
  }
  function closeGiftModal() {
    if (giftModal) giftModal.classList.add('hidden');
  }

  if (dockGiftBtn) dockGiftBtn.addEventListener('click', openGiftModal);
  if (popoverGiftBtn) popoverGiftBtn.addEventListener('click', openGiftModal);
  if (closeGiftModalBtn) closeGiftModalBtn.addEventListener('click', closeGiftModal);
  if (btnCloseGift) btnCloseGift.addEventListener('click', closeGiftModal);
  if (giftModal) {
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) closeGiftModal();
    });
  }

  window.copyToClipboard = function(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `<i class="fas fa-check text-xs"></i> <span>Disalin!</span>`;
      btnElement.classList.add('bg-emerald-500', 'text-white');
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.classList.remove('bg-emerald-500', 'text-white');
      }, 2000);
    }).catch(err => {
      console.error('Gagal salin teks:', err);
    });
  };
  
  // --- 10. CUSTOM MODAL & CONFIRM DIALOG ---
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
    if (!confirmModal) { onConfirm(); return; }
    if (confirmTitle) confirmTitle.innerText = title;
    if (confirmDesc) confirmDesc.innerText = desc;
    currentConfirmCallback = onConfirm;

    if (isAlertOnly) {
      if (dialogCancelBtn) dialogCancelBtn.classList.add('hidden');
      if (dialogYesBtn) {
        dialogYesBtn.className = "w-full py-3.5 rounded-xl bg-purpleTheme-900 text-butter-100 text-xs font-semibold uppercase cursor-pointer";
        dialogYesBtn.innerText = "FAHAM";
      }
    } else {
      if (dialogCancelBtn) dialogCancelBtn.classList.remove('hidden');
      if (dialogYesBtn) {
        dialogYesBtn.className = "w-1/2 py-3.5 rounded-xl bg-purpleTheme-900 text-butter-100 text-xs font-semibold uppercase cursor-pointer";
        dialogYesBtn.innerText = "YA, PASTI";
      }
    }

    if (modalIconBox && modalIconClass) {
      if (iconType === 'error') {
        modalIconBox.className = "w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-2xl mb-1 shadow-sm";
        modalIconClass.className = "fas fa-times animate-pulse";
      } else {
        modalIconBox.className = "w-14 h-14 rounded-full bg-butter-200 text-purpleTheme-700 mx-auto flex items-center justify-center text-xl mb-1 shadow-sm";
        modalIconClass.className = "fas fa-question-circle";
      }
    }
    confirmModal.classList.remove('hidden');
  }

  // =========================================================================
  // 11. RSVP SUBMIT (REAL-TIME LIVE CHECK & CLEAR STUCK DATA)
  // =========================================================================
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!SPREADSHEET_ID) return;
      
      const rsvpSubmitBtn = document.getElementById('rsvp-submit');
      const rsvpNameInput = document.getElementById('rsvp-name');
      const rsvpPhoneInput = document.getElementById('rsvp-phone');
      const rsvpStatusInput = document.getElementById('rsvp-status');
      const rsvpPaxInput = document.getElementById('rsvp-pax');
      const alertBox = document.getElementById('rsvp-alert');

      if (rsvpSubmitBtn) {
        rsvpSubmitBtn.disabled = true;
        rsvpSubmitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> Menyemak status terkini...`;
      }

      const configCheckUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;

      fetch(configCheckUrl)
        .then(res => res.text())
        .then(text => {
          const startIdx = text.indexOf('setResponse(');
          let isRsvpActive = true;

          if (startIdx !== -1) {
            const json = JSON.parse(text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')')));
            json.table.rows.forEach(r => {
              if (r && r.c) {
                [0, 5].forEach(colIdx => {
                  if (r.c[colIdx] && r.c[colIdx].v !== undefined) {
                    let keyName = String(r.c[colIdx].v).trim().toLowerCase();
                    if (keyName === 'control_rsvp') {
                      let valCell = r.c[colIdx + 1];
                      let val = valCell && valCell.v !== undefined ? String(valCell.v).trim().toUpperCase() : 'TRUE';
                      if (val === 'FALSE') isRsvpActive = false;
                    }
                  }
                });
              }
            });
          }

          if (!isRsvpActive) {
            if (rsvpSubmitBtn) {
              rsvpSubmitBtn.disabled = true;
              rsvpSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              rsvpSubmitBtn.innerText = "RSVP DITUTUP";
            }
            if (rsvpNameInput) { rsvpNameInput.value = ''; rsvpNameInput.disabled = true; }
            if (rsvpPhoneInput) { rsvpPhoneInput.value = ''; rsvpPhoneInput.disabled = true; }
            if (rsvpStatusInput) { rsvpStatusInput.value = 'Hadir'; rsvpStatusInput.disabled = true; }
            if (rsvpPaxInput) { rsvpPaxInput.value = '1'; rsvpPaxInput.disabled = true; }

            if (alertBox) {
              alertBox.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> Pengesahan RSVP telah ditutup oleh pengantin.`;
              alertBox.classList.remove('hidden');
              setTimeout(() => {
                alertBox.classList.add('hidden');
              }, 5000);
            }
            return;
          }

          if (rsvpSubmitBtn) {
            rsvpSubmitBtn.disabled = false;
            rsvpSubmitBtn.innerHTML = "Hantar Pengesahan";
          }

          showConfirmDialog("Hantar Pengesahan RSVP?", "Adakah anda pasti maklumat kehadiran sudah betul?", () => {
            setButtonCooldown(rsvpSubmitBtn, window.rsvpCd || 5, "Sila tunggu");

            const formData = new URLSearchParams();
            formData.append('action', 'rsvp');
            formData.append('name', rsvpNameInput.value);
            formData.append('phone', rsvpPhoneInput.value);
            formData.append('status', rsvpStatusInput.value);
            formData.append('pax', rsvpPaxInput.value);
            
            fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
              .then(response => response.json())
              .then(data => {
                if (alertBox) {
                  alertBox.innerHTML = data.status === "error" ? `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}` : `<i class="fas fa-check-circle text-purpleTheme-700 text-lg mr-2"></i> Terima kasih! RSVP berjaya disimpan.`;
                  alertBox.classList.remove('hidden');
                  setTimeout(() => alertBox.classList.add('hidden'), 5000);
                  if (data.status !== "error") rsvpForm.reset();
                }
              })
              .catch(error => console.error('RSVP Error:', error));
          });
        })
        .catch(err => {
          console.error("Gagal semak config RSVP:", err);
          if (rsvpSubmitBtn) { rsvpSubmitBtn.disabled = false; rsvpSubmitBtn.innerHTML = "Hantar Pengesahan"; }
        });
    });
  }

  // =========================================================================
  // 12. GALERI & UPLOAD
  // =========================================================================
  const fallbackGallery = [{ url: "images/Coming-Soon.jpg", caption: "Detik Manis Bersama Bermula Disini..." }];
  let defaultGallery = [];
  let currentSlide = 0;
  let slideTimer = null;
  let isUsingFallback = false;
  let selectedFileForUpload = null;
  
  const slideImg = document.getElementById('slideshow-img');
  const slideCaption = document.getElementById('slideshow-caption');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  const uploadModal = document.getElementById('upload-modal');
  const closeUploadModalBtn = document.getElementById('close-upload-modal');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const confirmUploadBtn = document.getElementById('confirm-upload-btn');
  const uploaderNameInput = document.getElementById('modal-uploader-name');
  const imageCaptionInput = document.getElementById('modal-image-caption');

  const btnMyPhotos = document.getElementById('btn-my-photos');
  const myPhotosModal = document.getElementById('my-photos-modal');
  const closeMyPhotosModalBtn = document.getElementById('close-my-photos-modal');
  const btnCloseMyPhotos = document.getElementById('btn-close-my-photos');
  const myPhotosGrid = document.getElementById('my-photos-grid');
  const btnUploadGallery = document.getElementById('btn-upload-gallery');
  const photoUploadInput = document.getElementById('photo-upload');

  if (btnUploadGallery && photoUploadInput) {
    btnUploadGallery.addEventListener('click', () => {
      if (!SPREADSHEET_ID) return;

      btnUploadGallery.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> Menyemak...`;
      const configCheckUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;

      fetch(configCheckUrl)
        .then(res => res.text())
        .then(text => {
          const startIdx = text.indexOf('setResponse(');
          let isGalleryActive = true;

          if (startIdx !== -1) {
            const json = JSON.parse(text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')')));
            json.table.rows.forEach(r => {
              if (r && r.c) {
                [0, 5].forEach(colIdx => {
                  if (r.c[colIdx] && r.c[colIdx].v !== undefined) {
                    let keyName = String(r.c[colIdx].v).trim().toLowerCase();
                    if (keyName === 'control_gallery') {
                      let valCell = r.c[colIdx + 1];
                      let val = valCell && valCell.v !== undefined ? String(valCell.v).trim().toUpperCase() : 'TRUE';
                      if (val === 'FALSE') isGalleryActive = false;
                    }
                  }
                });
              }
            });
          }

          if (!isGalleryActive) {
            btnUploadGallery.disabled = true;
            btnUploadGallery.classList.add('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
            btnUploadGallery.innerHTML = `<i class="fas fa-lock text-base"></i> Muat Naik Ditutup`;
            photoUploadInput.disabled = true;

            const galleryAlert = document.getElementById('gallery-alert');
            if (galleryAlert) {
              galleryAlert.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> Fungsi muat naik gambar telah ditutup oleh pengantin.`;
              galleryAlert.classList.remove('hidden');
              setTimeout(() => {
                galleryAlert.classList.add('hidden');
              }, 5000);
            }
            return;
          }

          btnUploadGallery.innerHTML = `<i class="fas fa-cloud-upload-alt text-base"></i> Muat Naik`;
          photoUploadInput.click();
        })
        .catch(err => {
          console.error("Gagal semak config galeri:", err);
          btnUploadGallery.innerHTML = `<i class="fas fa-cloud-upload-alt text-base"></i> Muat Naik`;
        });
    });

    photoUploadInput.addEventListener('change', (event) => {
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
    });
  }

  function fetchGalleryImages() {
    fetchSheetDataViaGViz('Gallery', function(data) {
      if (data && data.length > 0) {
        let fetchedGallery = data.map(item => ({
          url: item.url || item.URL || '',
          caption: `${item.caption || item.kapsyen || 'Kenangan'} (Oleh: ${item.name || item.nama || 'Tetamu'})`
        })).filter(img => img.url !== '');

        if (fetchedGallery.length > 0) {
          let shuffled = fetchedGallery.sort(() => 0.5 - Math.random());
          let quotaLimit = window.galleryQuotaLimit ? parseInt(window.galleryQuotaLimit) : 20;
          defaultGallery = shuffled.slice(0, quotaLimit);
          isUsingFallback = false;
          currentSlide = 0;
          renderSlide();
        } else {
          if (!isUsingFallback) { defaultGallery = [...fallbackGallery]; isUsingFallback = true; currentSlide = 0; renderSlide(); }
        }
      } else {
        if (!isUsingFallback) { defaultGallery = [...fallbackGallery]; isUsingFallback = true; currentSlide = 0; renderSlide(); }
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

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSlide--;
      renderSlide();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSlide++;
      renderSlide();
    });
  }

  function closeUploadModal() {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFileForUpload = null;
    if (photoUploadInput) photoUploadInput.value = '';
  }

  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);

  function saveMyUploadedPhotoToLocal(photoUrl, captionText) {
    try {
      let myUploads = JSON.parse(localStorage.getItem('my_wedding_uploads') || '[]');
      myUploads.push({ url: photoUrl, caption: captionText, time: new Date().toISOString() });
      localStorage.setItem('my_wedding_uploads', JSON.stringify(myUploads));
    } catch (e) {
      console.error("Gagal simpan ke localStorage:", e);
    }
  }

  function openMyPhotosModal() {
    if (!myPhotosGrid || !myPhotosModal) return;
    try {
      let myUploads = JSON.parse(localStorage.getItem('my_wedding_uploads') || '[]');
      if (myUploads.length === 0) {
        myPhotosGrid.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-purpleTheme-800/70 italic">Tiada rekod gambar dimuat naik dari peranti ini.</div>`;
      } else {
        myPhotosGrid.innerHTML = myUploads.map(item => `
          <div class="relative group rounded-xl overflow-hidden aspect-square bg-purpleTheme-50 border border-purpleTheme-100 shadow-sm">
            <img src="${item.url}" alt="My Upload" class="w-full h-full object-cover">
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
              <p class="text-[10px] truncate font-light">${item.caption}</p>
            </div>
          </div>
        `).join('');
      }
      myPhotosModal.classList.remove('hidden');
    } catch (e) {
      console.error("Gagal baca localStorage:", e);
    }
  }

  if (btnMyPhotos) btnMyPhotos.addEventListener('click', openMyPhotosModal);
  if (closeMyPhotosModalBtn) closeMyPhotosModalBtn.addEventListener('click', () => myPhotosModal.classList.add('hidden'));
  if (btnCloseMyPhotos) btnCloseMyPhotos.addEventListener('click', () => myPhotosModal.classList.add('hidden'));

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

      showConfirmDialog("Muat Naik Gambar?", "Adakah anda pasti mahu memuat naik gambar ini?", () => {
        setButtonCooldown(btnUploadGallery, window.galleryCd || 5, "Memuat Naik");
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
                if (data.status !== "error" && data.url) {
                  saveMyUploadedPhotoToLocal(data.url, imageCaption);
                }
                closeUploadModal();
                fetchGalleryImages();
              });
          };
        };
        reader.readAsDataURL(selectedFileForUpload);
      });
    });
  }

  // =========================================================================
  // 14. BUKU HAJAT & UCAPAN (REAL-TIME LIVE CHECK & CLEAR STUCK DATA)
  // =========================================================================
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
      const wishSubmitBtn = document.getElementById('btn-submit-wish');
      const wishAlert = document.getElementById('wish-alert');

      if (!SPREADSHEET_ID) return;

      if (wishSubmitBtn) {
        wishSubmitBtn.disabled = true;
        wishSubmitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> Menyemak status terkini...`;
      }

      const configCheckUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;

      fetch(configCheckUrl)
        .then(res => res.text())
        .then(text => {
          const startIdx = text.indexOf('setResponse(');
          let isWishActive = true;

          if (startIdx !== -1) {
            const json = JSON.parse(text.substring(startIdx + 'setResponse('.length, text.lastIndexOf(')')));
            json.table.rows.forEach(r => {
              if (r && r.c) {
                [0, 5].forEach(colIdx => {
                  if (r.c[colIdx] && r.c[colIdx].v !== undefined) {
                    let keyName = String(r.c[colIdx].v).trim().toLowerCase();
                    if (keyName === 'control_wish') {
                      let valCell = r.c[colIdx + 1];
                      let val = valCell && valCell.v !== undefined ? String(valCell.v).trim().toUpperCase() : 'TRUE';
                      if (val === 'FALSE') isWishActive = false;
                    }
                  }
                });
              }
            });
          }

          if (!isWishActive) {
            if (wishSubmitBtn) {
              wishSubmitBtn.disabled = true;
              wishSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
              wishSubmitBtn.innerText = "UCAPAN DITUTUP";
            }
            if (nameInput) { nameInput.value = ''; nameInput.disabled = true; }
            if (msgInput) { msgInput.value = ''; msgInput.disabled = true; }

            if (wishAlert) {
              wishAlert.innerHTML = `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> Ruangan ucapan telah ditutup oleh pengantin.`;
              wishAlert.classList.remove('hidden');
              setTimeout(() => {
                wishAlert.classList.add('hidden');
              }, 5000);
            }
            return;
          }

          if (wishSubmitBtn) {
            wishSubmitBtn.disabled = false;
            wishSubmitBtn.innerHTML = `<span>Hantar Ucapan</span> <i class="fas fa-paper-plane text-xs"></i>`;
          }

          if (!nameInput.value || !msgInput.value) {
            return;
          }

          showConfirmDialog("Hantar Ucapan & Doa?", "Adakah anda pasti mahu menghantar ucapan ini?", () => {
            setButtonCooldown(wishSubmitBtn, window.wishCd || 5, "Sila tunggu");

            const formData = new URLSearchParams();
            formData.append('action', 'wishes');
            formData.append('name', nameInput.value);
            formData.append('message', msgInput.value);
            
            fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
              .then(res => res.json())
              .then(data => {
                if (wishAlert) {
                  wishAlert.innerHTML = data.status === "error" ? `<i class="fas fa-exclamation-circle text-red-600 text-lg mr-2"></i> ${data.message}` : `Terima kasih! Ucapan berjaya direkodkan. 🤍`;
                  wishAlert.classList.remove('hidden');
                  setTimeout(() => wishAlert.classList.add('hidden'), 5000);
                }
                if (data.status !== "error") { nameInput.value = ''; msgInput.value = ''; fetchWishes(); }
              });
          });
        })
        .catch(err => {
          console.error("Gagal semak config Wish:", err);
          if (wishSubmitBtn) {
            wishSubmitBtn.disabled = false;
            wishSubmitBtn.innerHTML = `<span>Hantar Ucapan</span> <i class="fas fa-paper-plane text-xs"></i>`;
          }
        });
    });
  }

  // --- 15. APPLY SITE CONFIG (LOAD AWAL & PEMBETULAN PAPARAN QR CODE) ---
  function applySiteConfig(config) {
    const giftControl = config.control_gift;
    const dockGiftBtnEl = document.getElementById('dock-gift-btn');
    if (dockGiftBtnEl) {
      dockGiftBtnEl.style.display = (giftControl === false || String(giftControl).trim().toUpperCase() === "FALSE") ? 'none' : 'flex';
    }

    const bankSection = document.getElementById('bank-section');
    if (bankSection) {
      const bankControl = config.control_bank;
      if (bankControl === false || String(bankControl).trim().toUpperCase() === "FALSE") {
        bankSection.style.display = 'none';
      } else {
        bankSection.style.display = 'block';
        document.getElementById('bank-name').innerText = config.bank_name || '';
        document.getElementById('bank-holder').innerText = config.bank_holder || '';
        document.getElementById('bank-account').innerText = config.bank_account || '';
      }
    }

    // PEMBETULAN QR CODE GOOGLE DRIVE (MENYOKONG ID / PAUTAN PENUH & PROKSI WSRV.NL)
    const qrSection = document.getElementById('qr-section');
    if (qrSection) {
      const qrControl = config.control_qr;
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

    const addressSection = document.getElementById('address-section');
    if (addressSection) {
      const addressControl = config.control_address;
      if (addressControl === false || String(addressControl).trim().toUpperCase() === "FALSE") {
        addressSection.style.display = 'none';
      } else {
        addressSection.style.display = 'block';
        if (config.gift_address && document.getElementById('gift-address')) {
          document.getElementById('gift-address').innerText = config.gift_address;
        }
      }
    }

    const rsvpControl = config.control_RSVP !== undefined ? config.control_RSVP : config.control_rsvp;
    if (rsvpControl === false || String(rsvpControl).trim().toUpperCase() === "FALSE") {
      const rsvpBtn = document.getElementById('rsvp-submit');
      if (rsvpBtn) {
        rsvpBtn.disabled = true;
        rsvpBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
        rsvpBtn.innerText = "RSVP DITUTUP";
      }
      ['rsvp-name', 'rsvp-phone', 'rsvp-status', 'rsvp-pax'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.value = (id === 'rsvp-status') ? 'Hadir' : ((id === 'rsvp-pax') ? '1' : '');
          el.disabled = true;
        }
      });
    }

    const galleryControl = config.control_gallery;
    if (galleryControl === false || String(galleryControl).trim().toUpperCase() === "FALSE") {
      const uploadBtn = document.getElementById('btn-upload-gallery');
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-not-allowed', 'bg-gray-300', 'text-gray-600', 'border-gray-400');
        uploadBtn.innerHTML = `<i class="fas fa-lock text-base"></i> Muat Naik Ditutup`;
      }
      const photoInput = document.getElementById('photo-upload');
      if (photoInput) photoInput.disabled = true;
    }

    const wishControl = config.control_wish;
    if (wishControl === false || String(wishControl).trim().toUpperCase() === "FALSE") {
      const wishBtn = document.getElementById('btn-submit-wish');
      if (wishBtn) {
        wishBtn.disabled = true;
        wishBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400', 'pointer-events-none');
        wishBtn.innerText = "UCAPAN DITUTUP";
      }
      ['wish-name', 'wish-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.value = '';
          el.disabled = true;
        }
      });
    }
  }

});