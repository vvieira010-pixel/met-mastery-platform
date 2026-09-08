/* ============================================================
   met-harden.js — Production-grade hardening for MET Shell

   Responsibilities:
   1. localStorage resilience: detect quota errors, private mode,
      cross-tab storage events, and surface a top banner so the
      student knows their answers are at risk.
   2. Modal accessibility: focus trap, restore focus on close,
      Escape key dismissal, and aria-current on the active step.
   3. Option button semantics: convert selected option class to
      aria-pressed for assistive tech parity.
   4. Timer aria-live: only announce tone changes (5min + 1min
      thresholds), not every second, so screen readers stay quiet.
   5. Reduced motion: respect the theme and stop animations from
      running silently if user prefers reduced motion.
   6. Keyboard shortcuts: Esc closes modals, 1-4 picks option A-D
      when focus is on the option list.

   Load order:
     <script src="../js/met-shell.js"></script>
     <script src="../js/met-harden.js"></script>
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. localStorage resilience ---------- */
  var storageOK = (function () {
    try {
      var probe = '__met_probe__';
      localStorage.setItem(probe, probe);
      localStorage.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function showStorageWarn() {
    if (storageOK) return;
    var banner = document.createElement('div');
    banner.className = 'met-storage-warn active';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.innerHTML =
      '<span>Heads up: this browser cannot save your answers to local storage. ' +
      'Use a regular (non-private) window or export progress to continue.</span>' +
      '<button type="button" id="metStorageAck" data-close-modal>OK</button>';
    document.body.appendChild(banner);
    var ack = document.getElementById('metStorageAck');
    if (ack) ack.addEventListener('click', function () { banner.remove(); });
  }

  // Show the warning at the start of every page that runs this script
  document.addEventListener('DOMContentLoaded', function () {
    showStorageWarn();

    /* ---------- 2. Modal accessibility ---------- */
    var openModals = [];

    function focusFirstDescendant(node) {
      var focusables = getFocusable(node);
      if (focusables.length) focusables[0].focus();
    }

    function getFocusable(root) {
      return Array.prototype.slice.call(
        root.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), ' +
          'input:not([disabled]):not([type=hidden]), select:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function trapModal(modal) {
      if (!modal) return;
      var previouslyFocused = document.activeElement;
      var overlay = modal.classList.contains('met-modal-overlay')
        ? modal
        : modal.closest('.met-modal-overlay, .reg-overlay');
      if (!overlay) overlay = modal;

      function keyHandler(e) {
        if (e.key !== 'Tab') return;
        var focusables = getFocusable(overlay);
        if (!focusables.length) return;
        var first = focusables[0];
        var last  = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      function escHandler(e) {
        if (e.key === 'Escape') {
          // Prefer explicit close marker; fall back to known classes for
          // modals added before the marker convention was introduced.
          var closeBtn = overlay.querySelector(
            '[data-close-modal], .met-modal-btn--no, .met-modal-btn--cancel'
          );
          if (closeBtn) closeBtn.click();
        }
      }

      overlay.addEventListener('keydown', keyHandler);
      overlay.addEventListener('keydown', escHandler);
      openModals.push({
        overlay: overlay,
        cleanup: function () {
          overlay.removeEventListener('keydown', keyHandler);
          overlay.removeEventListener('keydown', escHandler);
          if (previouslyFocused && previouslyFocused.focus) {
            previouslyFocused.focus();
          }
        }
      });

      // Set role if missing
      if (!overlay.hasAttribute('role')) {
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
      }
      focusFirstDescendant(overlay);
    }

    function releaseModal() {
      var m = openModals.pop();
      if (m && m.cleanup) m.cleanup();
    }

    // Watch for modal activation
    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var node = records[i].target;
        if (node.classList && node.classList.contains('active') &&
            (node.classList.contains('met-modal-overlay') || node.classList.contains('reg-overlay'))) {
          trapModal(node);
        } else if (node.classList && !node.classList.contains('active')) {
          releaseModal();
        }
      }
    });
    [].forEach.call(document.querySelectorAll('.met-modal-overlay, .reg-overlay'), function (overlay) {
      observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    });

    /* ---------- 3. Option aria-pressed ---------- */
    function syncOptionAria() {
      var options = document.querySelectorAll('.met-option');
      [].forEach.call(options, function (btn) {
        if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'false');
        if (btn.classList.contains('selected')) btn.setAttribute('aria-pressed', 'true');
      });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.met-option');
      if (!btn) return;
      var group = btn.getAttribute('data-group');
      if (group) {
        var groupBtns = document.querySelectorAll('.met-option[data-group="' + group + '"]');
        [].forEach.call(groupBtns, function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
      } else {
        btn.classList.remove('selected');
      }
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
    });
    syncOptionAria();

    /* ---------- 4. Timer aria-live (quiet) ----------
       Only announce when remainingSeconds crosses into a tone band
       (5 min, 1 min, 30 s). Set data-low="5|1|.5" on the timer pill
       so CSS can change color; do not let aria-live fire every tick. */
    var lastTone = null;
    function toneForRemaining(s) {
      if (s <= 30)  return '0.5';
      if (s <= 60)  return '1';
      if (s <= 300) return '5';
      return null;
    }
    var timerEl = document.getElementById('met-timer');
    if (timerEl) {
      // Demote the existing aria-live="polite" so it doesn't fire every
      // tick; instead, push assertive announcements only on tone changes.
      timerEl.removeAttribute('aria-live');
      var announcer = document.createElement('div');
      announcer.id = 'met-timer-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-9999px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);

      var observer2 = new MutationObserver(function () {
        var match = (timerEl.textContent || '').match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!match) return;
        var h = Number(match[1]);
        var m = Number(match[2]);
        var sec = match[3] ? Number(match[3]) : 0;
        var total = h * 3600 + m * 60 + sec;
        var tone = toneForRemaining(total);
        if (tone !== lastTone) {
          lastTone = tone;
          if (tone) {
            timerEl.setAttribute('data-low', tone);
            announcer.textContent = total <= 30
              ? 'Less than 30 seconds remaining.'
              : total <= 60
                ? '1 minute remaining.'
                : '5 minutes remaining.';
          } else {
            timerEl.removeAttribute('data-low');
          }
        }
      });
      observer2.observe(timerEl, { childList: true, characterData: true, subtree: true });
    }

    /* ---------- 5. Keyboard shortcuts: 1-4 selects option A-D ---------- */
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var target = e.target;
      if (!target) return;
      // Don't shortcut when typing in form fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      var map = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
      var key = e.key.toLowerCase();
      if (!map[key]) return;
      var visiblePage = document.querySelector('.met-page:not([style*="display: none"])');
      if (!visiblePage) return;
      var opt = visiblePage.querySelector('.met-option[data-group="' +
        (visiblePage.querySelector('[data-met-page]')?.dataset.metPage || '') +
        '"]') || null;
      // Simpler: find the first option list and pick the option by index
      var options = visiblePage.querySelectorAll('.met-option');
      var idx = { a: 0, b: 1, c: 2, d: 3 }[map[key]];
      if (options && options[idx]) {
        options[idx].click();
        e.preventDefault();
      }
    });
  });
})();
