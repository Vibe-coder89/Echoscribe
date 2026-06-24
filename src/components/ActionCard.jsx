import React from 'react';
import { Link } from 'react-router-dom';

export const ActionCard = ({ title, description, icon: Icon, to, buttonText, onClick }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(231, 111, 81, 0.1)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          {Icon && <Icon size={24} />}
        </div>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
      
      {to ? (
        <span className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
          {buttonText || 'Go'}
        </span>
      ) : (
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClick}>
          {buttonText || 'Action'}
        </button>
      )}
    </div>
  );

  const cardStyle = {
    padding: '1.75rem',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  };

  if (to) {
    return (
      <Link to={to} className="card" style={cardStyle}>
        {content}
      </Link>
    );
  }

  return (
    <div className="card" style={cardStyle} onClick={onClick}>
      {content}
    </div>
  );
};
