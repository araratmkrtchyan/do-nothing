/* Fits the 390 x 844 design to the window.
   Phones: full width and the window's full height. The design's status-bar and home-indicator space is replaced by
   what the phone really has: the safe areas when opened from the Home Screen (the screen runs under a transparent
   status bar), and room for Safari's floating tab bar (iOS 26 and later) in a browser tab. A screen whose content
   needs more room than the window grows only by what it needs (that part scrolls).
   Tablets and desktops: the whole screen, centred. Add ?fitdebug to the address to see the measured values. */
(function () {
  var last = '', probe = null;
  function insets() {
    if (!probe) {
      probe = document.createElement('div');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
      document.body.appendChild(probe);
    }
    var cs = getComputedStyle(probe);
    return { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
  }
  function safariMajor() { var m = navigator.userAgent.match(/Version\/(\d+)/); return /iPhone|iPod/.test(navigator.userAgent) && m && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent) ? +m[1] : 0; }
  function fit() {
    var root = document.getElementById('dc-root'); if (!root || !document.body) return;
    var w = window.innerWidth, h = window.innerHeight, d = document.documentElement;
    var phone = w < 600, s, sh, ins = insets();
    var standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches);
    d.classList.toggle('dn-phone', phone);
    if (phone) {
      s = w / 390;
      // Insets in design pixels. Home Screen: the real status bar and home indicator. Browser tab: nothing on top
      // (Safari's own bar is above the page) and only the reported bottom inset; the window already stops above the tab bar.
      var topIn = standalone ? ins.top : 0;
      var botIn = ins.bottom;   // Safari's window already ends above its tab bar: reserving more left an empty band under the button
      d.style.setProperty('--dn-inset-top', (topIn / s) + 'px');
      d.style.setProperty('--dn-inset-bottom', (botIn / s) + 'px');
      d.style.setProperty('--dn-bottom-base', (standalone ? 8 : 16) + 'px');
      sh = Math.floor(h / s);
      d.style.setProperty('--dn-h', sh + 'px');            // try the window's own height first
      var need = 0, screens = root.querySelectorAll('.dn');
      for (var i = 0; i < screens.length; i++) {
        // Layout sizes (offsetTop/offsetHeight) ignore animations and transforms, so a breathing or moving element never
        // changes the height; floating layers (absolute/fixed) are skipped. scrollHeight misses the bottom padding.
        var el = screens[i], kids = el.children, end = 0;
        for (var j = 0; j < kids.length; j++) {
          var k = kids[j], pos = getComputedStyle(k).position;
          if (pos === 'absolute' || pos === 'fixed' || !k.offsetHeight) continue;
          end = Math.max(end, k.offsetTop - (k.offsetParent === el ? 0 : el.offsetTop) + k.offsetHeight);
        }
        need = Math.max(need, Math.ceil(end + (parseFloat(getComputedStyle(el).paddingBottom) || 0)));
      }
      if (need > sh + 8) sh = need;                          // content that cannot shrink: grow just enough
    } else { s = Math.min(w / 390, h / 844, 2); sh = 844; }
    var key = [w, h, sh, s, ins.top, ins.bottom, standalone].join(',');
    d.style.setProperty('--dn-h', sh + 'px');
    if (key === last) return; last = key;
    d.style.setProperty('--dn-fit', String(s));
    var scrolls = phone && sh * s > h + 1;
    document.body.style.height = scrolls ? Math.ceil(sh * s) + 'px' : h + 'px';
    document.body.style.overflowY = scrolls ? 'auto' : 'hidden';
    d.style.overflow = scrolls ? '' : 'hidden';
    root.style.marginTop = phone ? '0px' : Math.max(0, (h - 844 * s) / 2) + 'px';
    var screen = root.querySelector('.dn');
    if (screen) {
      var bg = getComputedStyle(screen).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)') {
        d.style.setProperty('--dn-page-bg', bg);
        var tc = document.querySelector('meta[name="theme-color"]');
        if (tc) tc.setAttribute('content', bg);               // Safari tints its own bars with this
      }
    }
    if (/[?&]fitdebug/.test(location.search)) {
      var box = document.getElementById('dn-fitdebug') || document.body.appendChild(Object.assign(document.createElement('pre'), { id: 'dn-fitdebug' }));
      box.style.cssText = 'position:fixed;left:8px;right:8px;top:40%;z-index:99;margin:0;padding:8px;font:12px/1.4 ui-monospace,monospace;background:rgba(0,0,0,.75);color:#fff;border-radius:8px;white-space:pre-wrap';
      box.textContent = 'window ' + w + ' x ' + h + '  screen ' + screen.width + ' x ' + screen.height + '\nsafe areas top ' + ins.top + '  bottom ' + ins.bottom + '\nhome-screen mode ' + standalone + '  safari ' + safariMajor() + '\nscale ' + s.toFixed(3) + '  design height ' + sh;
    }
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  document.addEventListener('DOMContentLoaded', fit);
  setInterval(fit, 300);   // screens change inside the prototype (a tip closes, the next screen opens): refit
})();
