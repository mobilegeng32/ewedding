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