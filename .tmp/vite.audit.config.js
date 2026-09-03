import base from '../vite.config.js';

const ROOT = 'C:/Users/vviei/platform0.3/platform0.3';

export default {
  ...base,
  root: ROOT,
  cacheDir: `${ROOT}/.tmp/vite-audit`,
  server: { ...(base.server || {}), port: 5175, host: '127.0.0.1' },
};
