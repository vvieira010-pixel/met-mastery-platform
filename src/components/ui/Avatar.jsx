const AVATAR_PALETTES = {
  auto:  ['#36545A','#557D84','#709BA1','#B27A3E','#F2AC55'],
  ink:   ['#36545A'],
  blue:  ['#709BA1'],
  teal:  ['#557D84'],
  amber: ['#F2AC55'],
  rose:  ['#E11D48'],
};
function pickColor(name, palette) {
  const arr = AVATAR_PALETTES[palette] || AVATAR_PALETTES.blue;
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h += name.charCodeAt(i);
  return arr[h % arr.length];
}

const SIZE_MAP = [
  { max: 28, cls: 'avatar-sm' },
  { max: 36, cls: 'avatar' },
  { max: Infinity, cls: 'avatar-lg' },
];

export function Avatar({ name = '?', size = 36, tone = 'auto' }) {
  const bg = pickColor(name, tone);
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const sizeCls = SIZE_MAP.find(s => size <= s.max)?.cls || 'avatar';
  return (
    <div
      role="img" aria-label={name}
      className={sizeCls}
      style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}
    >
      {initials}
    </div>
  );
}
