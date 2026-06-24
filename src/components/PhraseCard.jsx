import React from 'react';
import { Mic, CheckCircle2, ChevronRight } from 'lucide-react';

export const PhraseCard = ({ phrase, category, hint, isCompleted, isActive, onClick }) => {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{
        border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        transform: isActive ? 'scale(1.02)' : 'none',
        cursor: 'pointer',
        padding: '1.25rem',
        backgroundColor: isActive ? 'rgba(231, 111, 81, 0.02)' : 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1 }}>
        <div className="flex align-center gap-2" style={{ marginBottom: '0.25rem' }}>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: category === 'Essential' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(244, 162, 97, 0.1)',
              color: category === 'Essential' ? 'var(--color-accent)' : 'var(--color-secondary)'
            }}
          >
            {category}
          </span>
          {isCompleted && (
            <span className="badge badge-success flex align-center gap-1" style={{ textTransform: 'none' }}>
              <CheckCircle2 size={12} /> Trained
            </span>
          )}
        </div>
        <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: '0.25rem 0' }}>
          "{phrase}"
        </h4>
        {hint && (
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', italic: 'true' }}>
            Hint: {hint}
          </p>
        )}
      </div>
      
      <div style={{
        color: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '50%',
        backgroundColor: isActive ? 'rgba(231, 111, 81, 0.1)' : 'var(--bg-secondary)',
      }}>
        {isCompleted ? <CheckCircle2 size={20} /> : <Mic size={20} />}
      </div>
    </div>
  );
};
