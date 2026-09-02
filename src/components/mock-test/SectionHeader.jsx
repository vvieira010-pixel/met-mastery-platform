import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';

export default function SectionHeader({ label, onBack, timer }) {
  return (
    <header className="shdr">
      <div className="shdr__left">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="shdr__back-btn"
          aria-label="Back to section selection"
        >
          <Icon.arrowLeft size={14} /> Back
        </Button>
        <span className="shdr__label">{label}</span>
      </div>
      <div className="shdr__right">
        {timer}
      </div>
    </header>
  );
}