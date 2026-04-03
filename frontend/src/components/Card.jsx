import './Card.css';

export default function Card({ label, value, color = 'neutral', icon }) {
  return (
    <div className={`card card--${color}`}>
      <div className="card-header">
        <span className="card-label">{label}</span>
        {icon && <span className="card-icon">{icon}</span>}
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
}
