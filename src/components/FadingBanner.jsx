import { getLevelInfo } from '../lib/fading-manager.js';

export default function FadingBanner({ level, verdict, reason }) {
  const info = getLevelInfo(level);
  const isTransition = verdict === 'reduce' || verdict === 'restore';

  return (
    <div className={`fading-banner ${isTransition ? 'fading-banner--transition' : ''} fading-banner--lvl${level}`}>
      <div className="fading-banner-header">
        <span className="fading-badge">{info.label}</span>
        <span className="fading-label" style={{ opacity: 0.6, fontSize: 'var(--text-2xs)', fontWeight: 400 }}>Level {level}</span>
        {isTransition && <span className="fading-pill">{verdict === 'reduce' ? 'Less support!' : 'More support'}</span>}
      </div>
      {isTransition && reason ? (
        <p className="fading-msg">{reason}.</p>
      ) : (
        <p className="fading-msg">{info.desc}</p>
      )}
    </div>
  );
}
