import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, progress, trend, trendType, description }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '1.5rem' }}>
      <div>
        <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </h3>
          {Icon && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Icon size={20} />
            </div>
          )}
        </div>

        <div className="flex align-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            {value}
          </span>
          {trend && (
            <span 
              className="badge" 
              style={{
                backgroundColor: trendType === 'up' ? 'rgba(42, 157, 143, 0.15)' : 'rgba(231, 111, 81, 0.15)',
                color: trendType === 'up' ? 'var(--color-accent)' : 'var(--color-primary)',
                fontSize: 'var(--font-xs)',
                fontWeight: 'bold',
                padding: '2px 8px'
              }}
            >
              {trend}
            </span>
          )}
        </div>

        {description && (
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
            {description}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progress}%`, 
                backgroundColor: 'var(--color-accent)', 
                borderRadius: 'var(--radius-full)',
                transition: 'width 1s ease-out' 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
