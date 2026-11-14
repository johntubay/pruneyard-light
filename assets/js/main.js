/* Pruneyard Cabinets — LIGHT version interactions
   Blur-in headings, zoom-to-frame hero, mask wipes, horizontal pinned work,
   stacking process cards, slider, accordion. Falls back gracefully without GSAP. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = !!(window.gsap && window.ScrollTrigger) && !reduce;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var desktop = window.matchMedia('(min-width: 901px)').matches;

  /* Smooth scroll */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    if (G) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
  }

  /* Header */
  var hdr = $('.hdr');
  function onScroll() { if (hdr && !hdr.classList.contains('hdr--solid')) hdr.classList.toggle('is-solid', (window.scrollY || 0) > 60); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* Drawer */
  var drawer = $('.drawer');
  function setDrawer(o) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    if (lenis) o ? lenis.stop() : lenis.start();
    $$('[data-open]').forEach(function (b) { b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  }
  $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* Back to top */
  $$('[data-top]').forEach(function (b) { b.addEventListener('click', function () { lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }); }); });

  /* Slider */
  $$('[data-slider]').forEach(function (root) {
    var slides = $$('.slide', root), chips = $$('.chip', root), bar = $('.slider__bar i', root);
    var count = $('[data-count]', root), kick = $('[data-kick]', root), title = $('[data-title]', root), text = $('[data-text]', root);
    var i = 0, timer;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      chips.forEach(function (c, k) { c.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      var s = slides[i];
      if (count) count.textContent = ('0' + (i + 1)).slice(-2);
      [[kick, 'kick'], [title, 'title'], [text, 'text']].forEach(function (p) { if (p[0]) p[0].textContent = s.getAttribute('data-' + p[1]); });
      if (G) gsap.fromTo([kick, title, text], { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .07, ease: 'power3.out' });
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; if (!reduce) bar.classList.add('run'); }
      clearTimeout(timer); if (!reduce) timer = setTimeout(function () { go(i + 1); }, 6000);
    }
    var prev = $('[data-prev]', root), next = $('[data-next]', root);
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    chips.forEach(function (c, k) { c.addEventListener('click', function () { go(k); }); });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    go(0);
  });

  /* Accordion + image swap */
  $$('[data-acc]').forEach(function (root) {
    var items = $$('.acc__item', root), imgs = $$('[data-acc-img]', root), num = $('[data-acc-num]', root);
    function open(k) {
      items.forEach(function (it, j) {
        var on = j === k; it.classList.toggle('is-open', on);
        var b = $('.acc__btn', it); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', j === k); });
      if (num) num.textContent = ('0' + (k + 1)).slice(-2);
    }
    items.forEach(function (it, k) { var b = $('.acc__btn', it); if (b) b.addEventListener('click', function () { open(k); }); });
    open(0);
  });

  /* Split words for blur reveal */
  function words(el) {
    if (el.dataset.done) return $$('.bw', el);
    el.dataset.done = 1;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'bw'; s.textContent = p; f.appendChild(s);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    return $$('.bw', el);
  }

  if (!G) {
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-shown'); io.unobserve(e.target); } });
    }, { threshold: .1 }) : null;
    $$('[data-blur], [data-up]').forEach(function (el) { io ? io.observe(el) : el.classList.add('is-shown'); });
  } else {
    gsap.registerPlugin(ScrollTrigger);

    /* Blur-in headings (word by word) */
    $$('[data-blur]').forEach(function (el) {
      var w = words(el);
      gsap.set(el, { opacity: 1 });
      var inHero = el.closest('.hero, .phero');
      gsap.from(w, { opacity: 0, filter: 'blur(14px)', y: 14, duration: 1.2, ease: 'power3.out', stagger: .055, delay: inHero ? .2 : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 86%', once: true } });
    });
    /* Soft rise (batched for grids) */
    ScrollTrigger.batch('[data-up]', {
      start: 'top 90%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }); }
    });
    /* Label rules draw in */
    $$('.label-row .rule').forEach(function (r) {
      gsap.from(r, { scaleX: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 90%', once: true } });
    });
    /* Mask wipe images */
    $$('[data-mask]').forEach(function (el) {
      var img = $('img', el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'power4.inOut' });
      if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: 'power3.out' }, 0);
    });
    /* Parallax */
    $$('[data-par]').forEach(function (el) {
      var a = parseFloat(el.getAttribute('data-par')) || 6;
      gsap.fromTo(el, { yPercent: -a }, { yPercent: a, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* Hero: zoom-in on load, then shrink into a rounded frame as you scroll */
    var hero = $('.hero');
    if (hero) {
      var frame = $('.hero__frame', hero), himg = $('.hero__img img', hero), cont = $('.hero__content .wrap', hero);
      gsap.from(himg, { scale: 1.2, duration: 2.4, ease: 'power3.out' });
      gsap.from($$('.hero p, .hero__btns, .hero .pill, .hero__foot', hero), { y: 24, autoAlpha: 0, duration: 1.1, stagger: .1, delay: .5, ease: 'power3.out' });
      var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      tl.to(frame, { clipPath: 'inset(7% 3% 0% 3% round 28px)', ease: 'none' }, 0)
        .to(himg, { scale: 1.12, yPercent: 8, ease: 'none' }, 0)
        .to(cont, { yPercent: -18, autoAlpha: .2, ease: 'none' }, 0);
    }
    /* Page hero image */
    $$('.phero__img').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.5, ease: 'power4.inOut', delay: .2 });
      gsap.from($('img', el), { scale: 1.25, duration: 2, ease: 'power3.out', delay: .2 });
    });
    gsap.from($$('.phero .lead, .phero .crumb, .phero__band, .phero .pill'), { y: 20, autoAlpha: 0, duration: 1, stagger: .08, delay: .3, ease: 'power3.out' });

    /* Horizontal pinned work rail (desktop) */
    $$('[data-hwork]').forEach(function (sec) {
      var track = $('.hwork__track', sec), prog = $('.hwork__prog i', sec);
      if (!track || !desktop) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (s) { if (prog) prog.style.transform = 'scaleX(' + s.progress + ')'; } } });
    });

    /* Stacking cards: earlier cards shrink back as the next one arrives */
    if (desktop) {
      var cards = $$('.scard');
      cards.forEach(function (c, k) {
        if (k === cards.length - 1) return;
        gsap.to(c, { scale: .92 + k * .015, ease: 'none',
          scrollTrigger: { trigger: cards[k + 1], start: 'top bottom', end: 'top ' + (100 + (k + 1) * 22) + 'px', scrub: true } });
      });
    }
    /* Step cards & softc tilt-in */
    $$('.steps3').forEach(function (g) {
      gsap.from($$('.s3', g), { y: 80, rotate: function (i) { return (i - 1) * 2.5; }, autoAlpha: 0, duration: 1.2, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });
    /* Big CTA zoom */
    $$('.bigcta').forEach(function (b) {
      gsap.fromTo(b, { scale: .92, borderRadius: '48px' }, { scale: 1, borderRadius: '26px', ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
    /* Footer wordmark rises */
    /* Footer: nav links and contact rows rise in */
    $$('.ftr').forEach(function (f) {
      gsap.from($$('.ftr__links a, .ftr__row', f), { y: 40, autoAlpha: 0, duration: 1, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 85%', once: true } });
    });
    /* Material cards */
    $$('.mats').forEach(function (m) { gsap.from($$('.mat', m), { y: 60, rotate: 3, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: m, start: 'top 88%', once: true } }); });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* Form (front-end only — wire to Duda/CRM before launch) */
  var form = $('[data-form]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    $('.f-ok', form).style.display = 'block'; $('button[type=submit]', form).disabled = true;
  });
  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
