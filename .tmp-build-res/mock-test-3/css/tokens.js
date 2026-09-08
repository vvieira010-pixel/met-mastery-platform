/* ============================================================
   tokens.js — MET Mock Test design tokens

   Source of truth for color, typography, spacing, and radii.
   Mirrors the :root block in met-shell.css. The React platform's
   MOCK_TEST_1 should import these as JS constants or as Tailwind
   theme extensions rather than redefining them locally.

   Import path (Vite/Next/Webpack):
     import tokens from '../css/tokens.js';
   Or as named exports:
     import { metAzulDeep, metOrange, metSpace5 } from '../css/tokens.js';
   ============================================================ */

export const metColor = {
  brand: {
    azulDeep: '#0F1F4D',
    azulNavy: '#1B3A6B',
    azulMid:  '#3873A8',
    azulBlue: '#2B6097',
    azulLight:'#AED6F1',
    azulSky:  '#7AB5D8',
    azulWash: '#EBF4FB',
    orange:     '#BE5700',
    orangeDark: '#A54E00',
    orangeBg:   '#FFF4E6',
    red:    '#DC2626',
    green:  '#059669',
  },
  surface: {
    page:     '#F5F7FA',
    topbar:   '#0F1F4D', // var(--met-azul-deep)
    infobar:  '#1B3A6B', // var(--met-azul-navy)
    sidebar:  '#FFFFFF',
    sidebarBorder:'#D5DEEA',
    content:  '#FFFFFF',
    border:   '#D5DEEA',
    question: '#EBF4FB', // var(--met-azul-wash)
    player:   '#1B3A6B',
  },
  state: {
    qInfo:    '#3873A8',
    qInfoHover:'#2B6097',
    qCurrent: '#BE5700',
    qAnswered:'#059669',
    optionBorder: '#D5DEEA',
    btnNavBg:    '#0F1F4D',
    btnNavHover: '#1B3A6B',
    btnFinishBg:    '#BE5700',
    btnFinishHover: '#A54E00',
    btnFinishText:  '#FFFFFF',
  },
  ink: {
    strong: '#0F1F4D',
    slate:  '#4A5568',
  },
  overlay: 'rgba(15, 31, 77, 0.55)',
};

export const metFont = {
  body:    '"Atkinson Hyperlegible", "Aptos", "Segoe UI", Tahoma, sans-serif',
  display: '"Atkinson Hyperlegible", "Aptos", "Segoe UI", Tahoma, sans-serif',
};

export const metFontSize = {
  xs: '11px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  question: '18px',
  timer:    '26px',
};

export const metFontHeight = {
  base:  1.4,
  prose: 1.7,
};

export const metSpace = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '48px',
  8: '64px',
};

export const metRadius = {
  sm:   '4px',
  md:   '8px',
  pill: '999px',
};

export const metMotion = {
  base: '0.15s ease',
  fast: '0.12s ease',
  slow: '0.4s ease',
};

export const metLayout = {
  topbarMinHeight: '48px',
  sidebarMinHeight: '44px',
  modalMaxWidth: '440px',
  contentMaxWidth: '1120px',
  optionTapTarget: '44px',
};

export const metShell = {
  // Components in the test shell
  topbar: '.met-top-bar',
  infoBar: '.met-info-bar',
  sidebar: '.met-sidebar',
  contentWrap: '.met-content-wrap',
  content: '.met-content',
  bottomBar: '.met-bottom-bar',
};

export default {
  color: metColor,
  font: metFont,
  fontSize: metFontSize,
  fontHeight: metFontHeight,
  space: metSpace,
  radius: metRadius,
  motion: metMotion,
  layout: metLayout,
  shell: metShell,
};
