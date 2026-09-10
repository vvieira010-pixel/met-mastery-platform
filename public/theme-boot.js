/*
 * Theme bootstrap — applies the stored / system colour theme BEFORE first paint
 * so dark-mode users never see a flash of the light theme.
 *
 * This is an external file rather than an inline <script> on purpose: vercel.json
 * sets a strict CSP (`script-src 'self'`) and inline scripts are blocked unless
 * allowlisted by nonce or hash. Keep it external.
 */
(function () {
  var meta = document.getElementById('theme-color');
  var apply = function (t) {
    window.__theme = t;
    document.documentElement.setAttribute('data-theme', t);
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0B1520' : '#F4F9FC');
  };

  var t = null;
  try { t = localStorage.getItem('vv:theme'); } catch (e) {}

  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  apply(t);

  window.__setTheme = function (next) {
    apply(next);
    try { localStorage.setItem('vv:theme', next); } catch (e) {}
  };
})();
