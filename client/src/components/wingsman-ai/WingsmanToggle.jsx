
import './WingsmanToggle.css';
import wingsmanLogo from '../../assets/wingsmanai.png';

export default function WingsmanToggle({ enabled, onChange }) {
  return (
    <div className="wingsman-toggle">
      <img
        src={wingsmanLogo}
        alt="Wingsman AI"
        className="wingsman-toggle-logo"
      />

      <span className="wingsman-toggle-name">Wingsman AI</span>

      <button
        type="button"
        className={`wingsman-switch ${enabled ? 'is-enabled' : ''}`}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle Wingsman inline suggestions"
        title={
          enabled
            ? 'Disable inline suggestions'
            : 'Enable inline suggestions'
        }
        onClick={() => onChange(!enabled)}
      >
        <span className="wingsman-switch-thumb" />
      </button>
    </div>
  );
}
