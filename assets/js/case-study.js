// Case study interactions: image lightbox, reading progress, reveal on scroll.
(function () {
  document.documentElement.classList.add('js');

  // Lightbox
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var img = box.querySelector('img');
    var stage = box.querySelector('.lightbox__stage');
    var caption = box.querySelector('.lightbox__caption');
    var opener = null;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-zoom]');
      if (!trigger) return;
      opener = trigger;
      img.src = trigger.getAttribute('data-zoom');
      img.alt = trigger.getAttribute('data-alt') || '';
      caption.textContent = trigger.getAttribute('data-alt') || '';
      stage.classList.remove('is-actual');
      box.showModal();
    });

    // Click the image to toggle between fit-to-screen and actual size
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      stage.classList.toggle('is-actual');
    });
    // Click outside the image closes
    stage.addEventListener('click', function () { box.close(); });
    box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
    box.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) opener.focus();
    });
  } else {
    // No <dialog> support: open the image directly
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-zoom]');
      if (trigger) window.open(trigger.getAttribute('data-zoom'), '_blank', 'noopener');
    });
  }

  // Reading progress
  var bar = document.querySelector('.progress');
  if (bar) {
    var ticking = false;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
