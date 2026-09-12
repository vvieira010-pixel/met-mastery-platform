import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'react-hooks/set-state-in-effect': 'off',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        AbortController: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
        Notification: 'readonly',
        CustomEvent: 'readonly',
        history: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        MediaRecorder: 'readonly',
        Blob: 'readonly',
        crypto: 'readonly',
        FileReader: 'readonly',
        speechSynthesis: 'readonly',
        Audio: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        URLSearchParams: 'readonly',
        WebSocket: 'readonly',
        sessionStorage: 'readonly',
      },
    },
  },
  // Serverless API functions (Node runtime) — lint these too so security code
  // is not exempt from the quality gate.
  {
    files: ['api/**/*.js'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // `info` is allowed here on purpose: serverless handlers emit structured
      // JSON lines (e.g. ai_cascade_start) that are read from Vercel logs.
      // Browser-side code still may not use console.info.
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URLSearchParams: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        JSON: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        Intl: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
  },
  // Node test files (node --test). They run under Node, so process/globalThis/
  // fetch/console etc. are real globals. This closes the blind spot so test
  // files are held to the same no-undef quality bar as api/ and src/.
  {
    files: ['tests/**/*.{js,mjs}'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        globalThis: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        URLSearchParams: 'readonly',
        JSON: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        Intl: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        URL: 'readonly',
        structuredClone: 'readonly',
      },
    },
  },
  // Manual self-test harnesses (run via `bun`, not node:test). They print
  // progress with console.log, so the stricter node:test console discipline
  // does not apply. Kept in the lint net for no-undef/correctness; only
  // console is freed for these files.
  {
    files: ['tests/**/*.selftest.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
  // k6 load-test scripts (run via `k6 run`, not node:test). They execute in
  // k6's own runtime, whose globals (__ENV, __VU, __ITER, …) are not Node's.
  // Declare the k6 globals actually used so no-undef stays meaningful without
  // forcing the script into a Node-shaped config. (http/check/sleep/Rate/Trend
  // are imported from k6 packages, so they need no global entry.)
  {
    files: ['tests/**/*.k6.js'],
    languageOptions: {
      globals: {
        __ENV: 'readonly',
        __VU: 'readonly',
        __ITER: 'readonly',
      },
    },
  },
  // True ignore list — build output and vendored code only. Source files are no
  // longer globally ignored; see the legacy-tech-debt block below.
  {
    ignores: ['dist-build', 'node_modules', 'archive', '.vite-cache*'],
  },
  // Legacy files carrying pre-existing style tech-debt. These are LINTED, not
  // ignored: every correctness rule from js.configs.recommended (no-undef,
  // no-dupe-keys, no-unreachable, no-cond-assign, …) still applies to them.
  // Only the three noisy style rules are switched off, so the repo-wide
  // `--max-warnings 0` gate stays green.
  //
  // Why a `files` block instead of an `ignores` entry: as a global ignore this
  // list hid a real P0. src/pages/teacher-dashboard.jsx called `getReviews()`
  // without importing it. That ReferenceError fired while the
  // Promise.allSettled array literal was being evaluated (synchronously, before
  // allSettled ever ran), was swallowed by the surrounding catch, and the
  // teacher dashboard rendered permanently empty in production — while
  // `npm run lint` reported a clean tree.
  {
    files: [
      'src/App.jsx',
      'src/components/exercises/Listening.jsx',
      'src/components/mock-test/ListeningSection.jsx',
      'src/components/mock-test/MockTestEngine.jsx',
      'src/components/mock-test/MockTestThanks.jsx',
      'src/components/mock-test/ReadingSection.jsx',
      'src/components/resource-picker.jsx',
      'src/components/shared.jsx',
      'src/components/topic-explanations.jsx',
      'src/components/ui/Button.jsx',
      'src/components/ui/empty-illustrations.jsx',
      'src/components/ui/icons.jsx',
      'src/data/students.jsx',
      'src/domain/academic-records.js',
      'src/domain/admin.js',
      'src/domain/assessment/components/SectionContent.jsx',
      'src/domain/practice.js',
      'src/domain/roster.js',
      'src/lib/error-logger.js',
      'src/lib/exercise-bank.js',
      'src/lib/exercise-library.js',
      'src/lib/image-generation.js',
      'src/lib/prompts.js',
      'src/lib/risk-metrics.js',
      'src/lib/supabase-db.js',
      'src/lib/supabase-db/auth.js',
      'src/lib/supabase-db/students.js',
      'src/lib/toast-provider.jsx',
      'src/lib/tts-utils.js',
      'src/lib/workflow-academic.js',
      'src/lib/workflow-core.js',
      'src/pages/class-record.jsx',
      'src/pages/cohorts.jsx',
      'src/pages/diagnostic-create.jsx',
      'src/pages/diagnostics.jsx',
      'src/pages/error-bank.jsx',
      'src/pages/mock-test.jsx',
      'src/pages/reports.jsx',
      'src/pages/settings.jsx',
      'src/pages/speaking-eval.jsx',
      'src/pages/student-dashboard.jsx',
      'src/pages/student-feedback.jsx',
      'src/pages/student-helpers.jsx',
      'src/pages/student-home.jsx',
      'src/pages/student-homework.jsx',
      'src/pages/student-profile.jsx',
      'src/pages/students.jsx',
      'src/pages/student-settings.jsx',
      'src/pages/submission-review.jsx',
      'src/pages/teacher-dashboard.jsx',
      'src/pages/teacher-evaluation.jsx',
      'src/pages/writing-practice.jsx',
      'src/tools/tool-homework.jsx',
      'src/tools/tool-perspective-designer.jsx',
      // Dev-only manual-QA entry point (pairs with root `__harness.html`). It is an
      // app entry, so it intentionally defines a component without exporting it,
      // which the react-refresh rule flags. Not a production module — excluded here
      // rather than restructured. Remove both files if the harness is retired.
      'src/__harness.jsx',
    ],
    rules: {
      'no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
