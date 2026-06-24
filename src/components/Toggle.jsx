import React from 'react';

export const Toggle = ({ checked, onChange, label, description, id }) => {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex align-center justify-between gap-3" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex flex-col" style={{ flex: 1 }}>
        <label htmlFor={id} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
          {label}
        </label>
        {description && (
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
            {description}
          </span>
        )}
      </div>
      
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        style={{
          width: '52px',
          height: '28px',
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color var(--transition-fast)',
          position: 'relative',
          outline: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid transparent'
        }}
        className="toggle-container"
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            transition: 'transform var(--transition-fast)',
            transform: checked ? 'translateX(24px)' : 'translateX(0)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  );
};
