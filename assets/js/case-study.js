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

  // Hero carousel: thumbnails, arrows, arrow keys and swipe
  document.querySelectorAll('.carousel').forEach(function (root) {
    var slides = root.querySelectorAll('.carousel__slide');
    var thumbs = root.querySelectorAll('.carousel__thumb');
    var track = root.querySelector('.carousel__track');
    var caption = root.querySelector('.carousel__caption');
    var current = 0;

    var go = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle('is-active', n === current);
        s.setAttribute('aria-hidden', n === current ? 'false' : 'true');
        s.querySelector('button').tabIndex = n === current ? 0 : -1;
      });
      thumbs.forEach(function (t, n) {
        if (n === current) {
          t.setAttribute('aria-current', 'true');
          // Keep the active thumbnail in view on narrow screens without scrolling the page
          var strip = t.parentNode;
          if (t.offsetLeft < strip.scrollLeft) strip.scrollLeft = t.offsetLeft;
          else if (t.offsetLeft + t.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = t.offsetLeft + t.offsetWidth - strip.clientWidth;
        } else {
          t.removeAttribute('aria-current');
        }
      });
      if (caption) caption.textContent = slides[current].getAttribute('data-caption') || '';
    };

    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { go(+t.getAttribute('data-index')); });
    });
    root.querySelectorAll('.carousel__arrow').forEach(function (b) {
      b.addEventListener('click', function () { go(current + +b.getAttribute('data-dir')); });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });

    // Swipe on touch screens; a tap still opens the lightbox
    var startX = null, startY = 0;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        go(current + (dx < 0 ? 1 : -1));
      }
    });

    // Fetch the other screens once the page has loaded, so switching is instant
    window.addEventListener('load', function () {
      root.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
    });

    go(0);
  });

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
