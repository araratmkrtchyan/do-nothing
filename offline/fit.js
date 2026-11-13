/* Fits the 390 x 844 design to the window and matches the page colour to the screen.
   Phones: full width and the window's full height. A screen whose content needs more room than the window
   grows only by what it needs (that part scrolls). Tablets and desktops: the whole screen, centred. */
(function () {
  var last = '';
  function fit() {
    var root = document.getElementById('dc-root'); if (!root) return;
    var w = window.innerWidth, h = window.innerHeight, d = document.documentElement;
    var phone = w < 600, s, sh;
    var standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    d.classList.toggle('dn-web', phone && !standalone);   // in a browser tab, Safari's own bars stand in for the status bar and home indicator
    if (phone) {
      s = w / 390;
      sh = Math.floor(h / s);
      d.style.setProperty('--dn-h', sh + 'px');            // try the window's own height first
      var need = 0, screens = root.querySelectorAll('.dn');
      for (var i = 0; i < screens.length; i++) need = Math.max(need, screens[i].scrollHeight);
      if (need > sh + 8) sh = need;                          // content that cannot shrink: grow just enough (a few px of rounding is absorbed)
    } else { s = Math.min(w / 390, h / 844, 2); sh = 844; }
    var key = [w, h, sh, s].join(',');
    d.style.setProperty('--dn-h', sh + 'px');
    if (key === last) return; last = key;
    d.style.setProperty('--dn-fit', String(s));
    document.body.style.height = (!phone || sh * s <= h + 1) ? h + 'px' : Math.ceil(sh * s) + 'px';
    var scrolls = phone && sh * s > h + 1;
    document.body.style.overflowY = scrolls ? 'auto' : 'hidden';
    d.style.overflow = scrolls ? '' : 'hidden';
    root.style.marginTop = phone ? '0px' : Math.max(0, (h - 844 * s) / 2) + 'px';
    var screen = root.querySelector('.dn');
    if (screen) { var bg = getComputedStyle(screen).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)') d.style.setProperty('--dn-page-bg', bg); }
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  document.addEventListener('DOMContentLoaded', fit);
  setInterval(fit, 300);   // screens change inside the prototype (a tip closes, the next screen opens): refit
})();
