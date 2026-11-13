/* Scales the 390 x 844 screen to the window and matches the page colour to the screen. */
(function () {
  function fit() {
    var root = document.getElementById('dc-root'); if (!root) return;
    var w = window.innerWidth, h = window.innerHeight;
    var s = Math.min(w / 390, h / 844, 2);
    document.documentElement.style.setProperty('--dn-fit', String(s));
    document.body.style.height = h + 'px';
    document.body.style.overflow = 'hidden';
    root.style.marginTop = Math.max(0, (h - 844 * s) / 2) + 'px';
    var screen = root.querySelector('.dn');
    if (screen) { var bg = getComputedStyle(screen).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)') document.documentElement.style.setProperty('--dn-page-bg', bg); }
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  var n = 0, t = setInterval(function () { fit(); if (++n > 40) clearInterval(t); }, 100);
  document.addEventListener('DOMContentLoaded', fit);
})();
