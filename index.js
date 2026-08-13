// ===== Smooth scroll for internal links =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ===== Stable autoplay video handling =====
const serviceVideos = document.querySelectorAll('video[autoplay]');

const startVideoPlayback = (video) => {
  if (!(video instanceof HTMLVideoElement)) return;

  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', 'true');
  video.setAttribute('webkit-playsinline', 'true');
  video.preload = 'auto';
  video.load();

  const playSafely = () => {
    if (!video || video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.pause();
        });
      }
    }
  };

  const retryOnUserInteraction = () => {
    playSafely();
  };

  ['loadeddata', 'canplay', 'canplaythrough'].forEach(eventName => {
    video.addEventListener(eventName, playSafely, { once: true });
  });

  document.addEventListener('touchstart', retryOnUserInteraction, { once: true, passive: true });
  document.addEventListener('pointerdown', retryOnUserInteraction, { once: true });

  if (video.readyState >= 2) {
    playSafely();
  }
};

serviceVideos.forEach(video => {
  startVideoPlayback(video);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => video.pause());
        }
      }
    });
  }, { threshold: 0.25 });

  observer.observe(video);

  video.addEventListener('error', () => {
    video.pause();
  });
});

// ===== Scroll reveal animation for cards and sections =====
const revealTargets = document.querySelectorAll(
  '.hero-left, .hero-image, .hero-right, .services, .service-card, .work-card, .process-list li, .main-split, .about-tools, .about-body, .tools, .footer-left, .footer-right'
);

revealTargets.forEach((el, index) => {
  el.classList.add('reveal-element');
  if (el.matches('.service-card, .work-card, .process-list li')) {
    el.style.transitionDelay = `${(index % 6) * 0.08 + 0.05}s`;
  } else if (el.matches('.about-body, .tools, .footer-left, .footer-right, .main-split, .services')) {
    el.style.transitionDelay = '0.12s';
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealTargets.forEach(el => observer.observe(el));

// ===== Smooth tilt motion for featured work cards =====
const workCards = document.querySelectorAll('.work-card');
workCards.forEach(card => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 18;
    const py = (y / rect.height - 0.5) * -12;
    card.style.transform = `translateY(-8px) rotateX(${py}deg) rotateY(${px}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(12px) rotateX(0deg) rotateY(0deg)';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.25s ease-out';
  });
});

// ===== Respect reduced motion preference =====
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });
  workCards.forEach(card => {
    card.style.transform = 'translateY(12px)';
    card.style.transition = 'none';
  });
}
