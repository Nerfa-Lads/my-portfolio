/* =========================================================
   NERFA PORTFOLIO — Main JS
   ========================================================= */

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    backToTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backToTop.classList.remove('visible');
  }

  // Active nav link highlight
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// Auto-add reveal to key elements
document.querySelectorAll(
  '.skill-card, .project-card, .gallery-item, .timeline-item, .about-content-col, .about-image-col, .contact-link'
).forEach((el, i) => {
  el.setAttribute('data-reveal', '');
  if (i % 3 === 1) el.setAttribute('data-reveal-delay', '1');
  if (i % 3 === 2) el.setAttribute('data-reveal-delay', '2');
  revealObserver.observe(el);
});

// --- Gallery filter ---
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    galleryItems.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-cat') === filter) {
        item.classList.remove('hidden');
        item.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// --- Contact form — posts to /api/contact (Resend) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');

    btn.textContent = 'Sending...';
    btn.disabled = true;
    status.className = 'form-status';

    const body = {
      name:    document.getElementById('name').value.trim(),
      email:   document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        status.textContent = "Message sent! I'll get back to you soon.";
        status.className = 'form-status success';
        contactForm.reset();
      } else {
        throw new Error(data.error || 'Something went wrong.');
      }
    } catch (err) {
      status.textContent = err.message || 'Failed to send. Please try again.';
      status.className = 'form-status error';
    } finally {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
}

// --- Fade-in animation keyframe ---
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }';
document.head.appendChild(style);

// =========================================================
// LIGHTBOX
// =========================================================
const lightbox        = document.getElementById('lightbox');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxImgWrap = document.getElementById('lightboxImgWrap');

// Collect every clickable image across the page
// — gallery items + project card images
let lbImages = [];
let lbIndex  = 0;

function buildImageList() {
  lbImages = [];

  // Gallery items
  document.querySelectorAll('.gallery-item img').forEach(img => {
    lbImages.push({ src: img.src, caption: img.closest('.gallery-item').querySelector('span')?.textContent || img.alt });
  });

  // Project card images (only the ones not already in gallery)
  document.querySelectorAll('.project-img img').forEach(img => {
    if (!lbImages.find(i => i.src === img.src)) {
      lbImages.push({ src: img.src, caption: img.closest('.project-card')?.querySelector('h3')?.textContent || img.alt });
    }
  });
}

function openLightbox(src) {
  buildImageList();
  lbIndex = lbImages.findIndex(i => i.src === src);
  if (lbIndex === -1) lbIndex = 0;
  showImage(lbIndex);
  lightbox.classList.add('open');
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function showImage(index) {
  const item = lbImages[index];
  lightboxImgWrap.style.animation = 'none';
  lightboxImg.src = item.src;
  lightboxImg.alt = item.caption;
  lightboxCaption.textContent = item.caption;
  // re-trigger animation
  void lightboxImgWrap.offsetWidth;
  lightboxImgWrap.style.animation = '';
  // hide arrows if only one image
  lightboxPrev.style.display = lbImages.length > 1 ? '' : 'none';
  lightboxNext.style.display = lbImages.length > 1 ? '' : 'none';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', closeLightbox);

lightboxPrev.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  showImage(lbIndex);
});

lightboxNext.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbImages.length;
  showImage(lbIndex);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showImage(lbIndex); }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showImage(lbIndex); }
});

// Make gallery items clickable
document.querySelectorAll('.gallery-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    openLightbox(item.querySelector('img').src);
  });
});

// Make project card images clickable
document.querySelectorAll('.project-img').forEach(wrap => {
  wrap.style.cursor = 'zoom-in';
  wrap.addEventListener('click', () => {
    openLightbox(wrap.querySelector('img').src);
  });
});

// Make project view buttons open lightbox
document.querySelectorAll('.project-view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(new URL(btn.dataset.src, window.location.href).href);
  });
});

// Reference to lightboxImgWrap for animation reset — declared above
