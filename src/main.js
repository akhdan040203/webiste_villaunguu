import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80,
});

const menuToggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const siteHeader = document.querySelector('[data-site-header]');
const counters = document.querySelectorAll('[data-count-up]');
const serviceCarousel = document.querySelector('[data-service-carousel]');
const testimonialCarousel = document.querySelector('[data-testimonial-carousel]');

const syncHeaderState = () => {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('hidden', isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menu.classList.add('hidden');
  });
});

syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target ?? 0);
  const suffix = counter.dataset.suffix ?? '';
  const duration = 1200;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * easedProgress);

    counter.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.4 },
);

counters.forEach((counter) => counterObserver.observe(counter));

if (serviceCarousel) {
  const track = serviceCarousel.querySelector('[data-service-track]');
  const cards = [...serviceCarousel.querySelectorAll('[data-service-card]')];
  const prevButton = serviceCarousel.querySelector('[data-service-prev]');
  const nextButton = serviceCarousel.querySelector('[data-service-next]');
  let servicePage = 0;
  let serviceTimer;
  const totalPages = Math.max(cards.length, 1);

  const getGap = () => {
    if (!track) return 0;
    return Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
  };

  const updateServices = (page) => {
    if (!track || cards.length === 0) return;

    servicePage = (page + totalPages) % totalPages;
    const activeIndex = servicePage;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const step = cardWidth + getGap();
    const viewportWidth = track.parentElement.clientWidth;
    const centeredOffset = activeIndex * step - (viewportWidth - cardWidth) / 2;
    const maxOffset = Math.max(track.scrollWidth - viewportWidth, 0);
    const offset = Math.min(Math.max(centeredOffset, 0), maxOffset);

    track.style.transform = `translateX(-${offset}px)`;

    cards.forEach((card, index) => {
      card.classList.toggle('is-active', index === activeIndex);
    });

  };

  const startServiceTimer = () => {
    window.clearInterval(serviceTimer);
    serviceTimer = window.setInterval(() => {
      updateServices(servicePage + 1);
    }, 3200);
  };

  prevButton?.addEventListener('click', () => {
    updateServices(servicePage - 1);
    startServiceTimer();
  });

  nextButton?.addEventListener('click', () => {
    updateServices(servicePage + 1);
    startServiceTimer();
  });

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      updateServices(index);
      startServiceTimer();
    });
  });

  updateServices(0);
  startServiceTimer();
  window.addEventListener('resize', () => updateServices(servicePage));
}

if (testimonialCarousel) {
  const track = testimonialCarousel.querySelector('[data-testimonial-track]');
  const cards = [...testimonialCarousel.querySelectorAll('[data-testimonial-card]')];
  const pagination = testimonialCarousel.querySelector('[data-testimonial-pagination]');
  let testimonialPage = 0;
  let testimonialTimer;
  const totalPages = Math.max(cards.length - 2, 1);

  const getGap = () => {
    if (!track) return 0;
    return Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
  };

  const dots = Array.from({ length: totalPages }, (_, index) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Tampilkan testimoni ${index + 1}`);
    pagination?.append(dot);
    return dot;
  });

  const updateTestimonials = (page) => {
    if (!track || cards.length === 0) return;

    testimonialPage = (page + totalPages) % totalPages;
    const activeIndex = testimonialPage + 1;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const step = cardWidth + getGap();
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const offset = isDesktop
      ? testimonialPage * step
      : activeIndex * step - (track.parentElement.clientWidth - cardWidth) / 2;

    track.style.transform = `translateX(-${offset}px)`;

    cards.forEach((card, index) => {
      card.classList.toggle('is-active', index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === testimonialPage);
      dot.setAttribute('aria-current', index === testimonialPage ? 'true' : 'false');
    });
  };

  const startTestimonialTimer = () => {
    window.clearInterval(testimonialTimer);
    testimonialTimer = window.setInterval(() => {
      updateTestimonials(testimonialPage + 1);
    }, 3600);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateTestimonials(index);
      startTestimonialTimer();
    });
  });

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const page = Math.min(Math.max(index - 1, 0), totalPages - 1);

      updateTestimonials(page);
      startTestimonialTimer();
    });
  });

  updateTestimonials(0);
  startTestimonialTimer();
  window.addEventListener('resize', () => updateTestimonials(testimonialPage));
}
