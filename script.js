(function () {
  'use strict';

  var root = document.documentElement;
  var mbar = document.getElementById('mbar');
  var toggle = document.getElementById('menuToggle');
  var drawer = document.getElementById('drawer');
  var backdrop = document.getElementById('drawerBackdrop');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var railList = document.getElementById('railList');
  var railInd = document.getElementById('railInd');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var desktopQuery = window.matchMedia('(min-width: 1100px)');
  var WA_DEFAULT = '966556408766';
  var ticking = false;

  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) {
      drawer.removeAttribute('inert');
    } else {
      drawer.setAttribute('inert', '');
    }
  }

  function isMenuOpen() {
    return root.classList.contains('menu-open');
  }

  function moveIndicator() {
    var active = railList.querySelector('.rail-link.active');
    if (!active || !active.offsetHeight) {
      railInd.style.opacity = '0';
      return;
    }
    railInd.style.top = active.offsetTop + 'px';
    railInd.style.height = active.offsetHeight + 'px';
    railInd.style.opacity = '1';
  }

  function getSections() {
    var seen = {};
    var list = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      if (!id || seen[id]) return;
      var el = document.getElementById(id);
      if (el) {
        seen[id] = true;
        list.push({ id: id, el: el });
      }
    });
    return list;
  }

  function setActive(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', match);
      if (match) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    moveIndicator();
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop || 0;
    var maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);

    progress.style.setProperty('--p', Math.min(y / maxScroll, 1).toFixed(4));
    toTop.classList.toggle('show', y > 700);

    var sections = getSections();
    if (!sections.length) return;

    var offset = desktopQuery.matches ? 0 : mbar.offsetHeight;
    var line = y + offset + window.innerHeight * 0.3;
    var current = sections[0].id;
    sections.forEach(function (s) {
      var top = s.el.getBoundingClientRect().top + y;
      if (top <= line) current = s.id;
    });

    if (window.innerHeight + y >= root.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }

    setActive(current);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(!isMenuOpen());
  });

  backdrop.addEventListener('click', function () {
    setMenu(false);
  });

  function onBreakpoint(e) {
    if (e.matches && isMenuOpen()) setMenu(false);
    requestUpdate();
    moveIndicator();
  }

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', onBreakpoint);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(onBreakpoint);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute('href').slice(1);
    if (!id) return;

    e.preventDefault();

    var target = document.getElementById(id);
    var wasOpen = isMenuOpen();
    if (wasOpen) setMenu(false);
    if (!target) return;

    var go = function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        history.replaceState(null, '', '#' + id);
      } catch (err) {}
    };

    if (wasOpen) {
      setTimeout(go, 80);
    } else {
      go();
    }
  });

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-wa]'), function (a) {
    var number = a.getAttribute('data-wa') || WA_DEFAULT;
    var text = a.getAttribute('data-wa-text');
    var href = 'https://wa.me/' + number;
    if (text) href += '?text=' + encodeURIComponent(text);
    a.setAttribute('href', href);
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (panel) {
    Array.prototype.forEach.call(panel.querySelectorAll('.chip'), function (chip, index) {
      chip.style.setProperty('--i', index);
    });
  });

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.rv'));

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('img[data-fb]'), function (img) {
    var host = img.closest('.fb-host');
    if (!host) return;

    function markMissing() {
      host.classList.add('is-missing');
    }

    img.addEventListener('error', markMissing);
    img.addEventListener('load', function () {
      if (img.naturalWidth > 0) host.classList.remove('is-missing');
    });

    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var galleryBtns = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lbList = [];
  var lbIndex = -1;
  var lbOpener = null;
  var touchX = null;

  function loadedButtons() {
    return galleryBtns.filter(function (btn) {
      var img = btn.querySelector('img');
      return !btn.classList.contains('is-missing') && img && img.complete && img.naturalWidth > 0;
    });
  }

  function showLightbox() {
    var img = lbList[lbIndex].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    var multiple = lbList.length > 1;
    lbPrev.style.display = multiple ? '' : 'none';
    lbNext.style.display = multiple ? '' : 'none';
  }

  function openLightbox(btn) {
    lbList = loadedButtons();
    lbIndex = lbList.indexOf(btn);
    if (lbIndex < 0) return;
    lbOpener = btn;
    showLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.removeAttribute('inert');
    root.classList.add('lb-open');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('inert', '');
    root.classList.remove('lb-open');
    if (lbOpener) lbOpener.focus();
  }

  function stepLightbox(dir) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    showLightbox();
  }

  galleryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLightbox(btn);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { stepLightbox(-1); });
  lbNext.addEventListener('click', function () { stepLightbox(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 50) return;
    stepLightbox(dx > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    var lbOpen = lightbox.classList.contains('open');
    if (e.key === 'Escape') {
      if (lbOpen) {
        closeLightbox();
      } else if (isMenuOpen()) {
        setMenu(false);
        toggle.focus();
      }
    } else if (lbOpen && e.key === 'ArrowRight') {
      stepLightbox(-1);
    } else if (lbOpen && e.key === 'ArrowLeft') {
      stepLightbox(1);
    }
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', function () {
    requestUpdate();
    moveIndicator();
  });
  window.addEventListener('load', function () {
    requestUpdate();
    moveIndicator();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(moveIndicator);
  }

  lightbox.setAttribute('inert', '');
  setMenu(false);
  update();
})();