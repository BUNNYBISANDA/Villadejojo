// Mobile nav toggle + close on link click
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }));
}

// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Contact form – mailto (no backend). Adjust email in HTML.
function sendMessage(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  const href = `mailto:villadejojo@gmail.com?subject=${encodeURIComponent('Villa de Jojo Inquiry')}&body=${body}`;
  window.location.href = href;
  const feedback = form.querySelector('.form-feedback');
  if (feedback) feedback.textContent = 'Opening your email app…';
  return false;
}

// Simple lightbox for gallery
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

// Ensure room images also open in the lightbox (not a new tab)
// If any room image links are missing the data-lightbox attribute, add it.
const roomThumbs = document.querySelectorAll('.room-card .room-media a[href], .room-block .room-photo a[href]');
roomThumbs.forEach((a) => {
  if (!a.hasAttribute('data-lightbox')) a.setAttribute('data-lightbox', '');
  // Add the same quick click "pop" effect used in the gallery
  a.addEventListener('click', () => {
    a.classList.add('is-pop');
    setTimeout(() => a.classList.remove('is-pop'), 180);
  });
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-lightbox]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (!href) return;
  if (lightbox && lightboxImg) {
    a.classList.add('is-pop');
    setTimeout(() => a.classList.remove('is-pop'), 180);
    lightboxImg.src = href;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('open');
  }
});

lightboxClose?.addEventListener('click', () => {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
});
// Room filter chips
const chips = document.querySelectorAll('.chip');
const grid = document.getElementById('roomsGrid');
if (chips.length && grid) {
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const type = chip.dataset.filter;
    grid.querySelectorAll('.room-card').forEach(card => {
      const show = type === 'all' || card.dataset.type === type;
      card.style.display = show ? '' : 'none';
    });
  }));
}

// Scroll reveal animations (no HTML changes needed)
// Adds .will-reveal to targets and toggles .is-visible on scroll
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups = [
    { sel: ['.hero h1', '.hero p', '.hero .hero-actions'] },
    { sel: ['#about h2', '#about p', '.photo-card'], variant: { '.photo-card': 'zoom' } },
    { sel: ['#rooms h2', '#rooms .feature'] },
    { sel: ['#gallery h2', '#gallery .gallery-grid > *'] },
    { sel: ['#location h2', '#location p', '.map-embed'], variant: { '.map-embed': 'zoom' } },
    { sel: ['#contact h2', '#contact p', '.contact-form'], variant: { '.contact-form': 'slide-up' } },
    // Rooms page
    { sel: ['.subhero h1', '.subhero p'] },
    { sel: ['.chips .chip'] },
    { sel: ['.rooms-grid .room-card'], variant: { '.rooms-grid .room-card': 'zoom' } },
    // Add zoom-in reveal for the three room info cards on rooms page
    { sel: ['.room-list .room-block'], variant: { '.room-list .room-block': 'zoom' } },
    { sel: ['.facilities-grid .facility'] },
  ];

  const targets = [];
  groups.forEach(group => {
    let i = 0;
    group.sel.forEach(s => {
      document.querySelectorAll(s).forEach(el => {
        el.classList.add('will-reveal');
        // Variant mapping
        if (group.variant && Object.prototype.hasOwnProperty.call(group.variant, s)) {
          el.classList.add(group.variant[s]);
        }
        // Stagger per group
        el.style.setProperty('--delay', `${(i++) * 0.06}s`);
        targets.push(el);
      });
    });
  });

  if (!targets.length) return;

  if (prefersReduced) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  targets.forEach(el => io.observe(el));
})();

// Header: elevate on scroll
(function() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Gallery carousel: translateX, arrows, dots (2 per desktop, 1 per mobile)
(function () {
  const carousel = document.querySelector('#gallery .gallery-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.gallery-viewport');
  const track = carousel.querySelector('.gallery-grid');
  const slides = Array.from(track.querySelectorAll('.g'));
  const prev = carousel.querySelector('.gallery-nav.prev');
  const next = carousel.querySelector('.gallery-nav.next');
  const dotsWrap = carousel.querySelector('.gallery-dots');
  if (!viewport || !track || !slides.length || !prev || !next || !dotsWrap) return;

  // Determine items per view: 2 desktop, 1 mobile
  const itemsPerView = () => (window.innerWidth <= 640 ? 1 : 2);
  const GAP_DESKTOP = 10; // matches CSS gap

  let perView = 1; // slides per page
  let pages = 1;   // total pages
  let page = 0;    // active page (0-based)

  // Apply layout so each page fits the viewport width exactly
  function applyLayout() {
    perView = itemsPerView();

    // Adjust gap and basis to make page width == viewport width
    track.style.gap = perView === 1 ? '0px' : `${GAP_DESKTOP}px`;
    const basis = perView === 1 ? '100%' : `calc((100% - ${GAP_DESKTOP}px) / 2)`;
    slides.forEach((s) => { s.style.flex = `0 0 ${basis}`; });
  }

  function calcPages() {
    pages = Math.max(1, Math.ceil(slides.length / perView));
  }

  function applyTransform() {
    const pageWidth = viewport.clientWidth;
    track.style.transform = `translateX(${-page * pageWidth}px)`;
  }

  function updateArrows() {
    prev.disabled = page <= 0;
    next.disabled = page >= pages - 1;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Go to gallery page ${i + 1}`);
      if (i === page) b.setAttribute('aria-selected', 'true');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    }
  }

  function updateDots() {
    Array.from(dotsWrap.children).forEach((d, i) => {
      if (i === page) d.setAttribute('aria-selected', 'true');
      else d.removeAttribute('aria-selected');
    });
  }

  function goTo(nextPage) {
    page = Math.max(0, Math.min(nextPage, pages - 1));
    applyTransform();
    updateArrows();
    updateDots();
  }
  

  // Navigation
  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  // Handle resize: keep roughly same starting item visible
  window.addEventListener('resize', () => {
    const startIndex = page * perView;
    applyLayout();
    calcPages();
    page = Math.floor(startIndex / perView);
    buildDots();
    applyTransform();
    updateArrows();
  });

  // Init
  applyLayout();
  calcPages();
  buildDots();
  goTo(0);

  // Subtle pop on click (keeps your existing effect)
  slides.forEach((a) => {
    a.addEventListener('click', () => {
      a.classList.add('is-pop');
      setTimeout(() => a.classList.remove('is-pop'), 180);
    });
  });
})();
