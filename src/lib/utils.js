import { lazy } from 'react';

export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function generateShortId(prefix = '') {
  return prefix + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
}

const LAZY_REFRESH_KEY = 'met-mastery:lazy-import-refreshed';
const LAZY_RETRY_DELAY_MS = 800;

function waitForLazyRetry() {
  return new Promise((resolve) => window.setTimeout(resolve, LAZY_RETRY_DELAY_MS));
}

function canRefreshForLazyImport() {
  try {
    if (window.sessionStorage.getItem(LAZY_REFRESH_KEY)) return false;
    window.sessionStorage.setItem(LAZY_REFRESH_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

/**
 * Retries a transient dynamic-import failure, then performs at most one refresh
 * for an outdated deployment. A second failure reaches the ErrorBoundary
 * instead of trapping the learner in a permanent loading state.
 */
export function lazyWithRetry(componentImport, maxRetries = 2) {
  return lazy(async () => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        const module = await componentImport();
        try {
          window.sessionStorage.removeItem(LAZY_REFRESH_KEY);
        } catch {
          // Session storage may be unavailable in a private browser context.
        }
        return module;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) await waitForLazyRetry();
      }
    }

    if (canRefreshForLazyImport()) {
      console.warn('[lazyWithRetry] Refreshing once after a failed dynamic import.', lastError);
      window.location.reload();
      return new Promise(() => {});
    }

    throw lastError;
  });
}

/**
 * Check microphone permission state without prompting.
 * Returns: 'granted' | 'denied' | 'prompt' | 'unsupported'
 */
export async function checkMicrophonePermission() {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }
  try {
    const perm = await navigator.permissions.query({ name: 'microphone' });
    return perm.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unsupported';
  }
}

/**
 * Get user-friendly guidance for microphone permission state.
 */
export function getMicrophoneGuidance(state) {
  const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  switch (state) {
    case 'denied':
      return {
        title: 'Microphone blocked',
        message: 'You previously blocked microphone access. To record, you need to allow it in your browser settings.',
        steps: [
          'Click the lock/microphone icon in your browser address bar',
          'Change microphone permission to "Allow"',
          'Reload this page'
        ],
        showHTTPSWarning: !isHTTPS
      };
    case 'prompt':
      return {
        title: 'Permission needed',
        message: 'We need permission to access your microphone for recording.',
        steps: [
          'Click "Allow" when the browser prompts you',
          'If no prompt appears, check the address bar for a blocked icon'
        ],
        showHTTPSWarning: !isHTTPS
      };
    case 'unsupported':
      return {
        title: 'Recording not supported',
        message: 'Your browser does not support microphone permission checks.',
        steps: [
          'Use a modern browser (Chrome, Firefox, Safari, Edge)',
          'Ensure you are on HTTPS (or localhost)'
        ],
        showHTTPSWarning: !isHTTPS
      };
    default:
      return {
        title: 'Ready',
        message: 'Microphone access is granted.',
        steps: [],
        showHTTPSWarning: !isHTTPS
      };
  }
}

/**
 * Request microphone access with a clear prompt.
 * Returns the MediaStream on success, throws on failure.
 */
export async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia not supported');
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}
