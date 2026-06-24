import React from 'react';

export const ChartMock = ({ type = 'bar', data = [], height = 200, unit = '%' }) => {
  // Safe bounds
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No chart data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 10);

  // Render circular donut chart
  if (type === 'donut') {
    const percentage = Math.min(100, Math.max(0, data[0]?.value || 0));
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--bg-secondary)"
              strokeWidth="8"
            />
            {/* Foreground circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--color-accent)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              {percentage}{unit}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {data[0]?.label || 'Score'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render vertical Bar Chart
  if (type === 'bar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, width: '100%', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1, gap: '8px', borderBottom: '2px solid var(--color-border)', paddingBottom: '4px' }}>
          {data.map((item, index) => {
            const pct = (item.value / maxValue) * 100;
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {/* Tooltip on hover */}
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    backgroundColor: 'var(--color-text)',
                    color: '#FFF',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    marginBottom: '4px',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }} className="chart-tooltip">
                    {item.value}{unit}
                  </div>
                  
                  {/* Bar */}
                  <div
                    style={{
                      height: `${pct}%`,
                      width: '80%',
                      maxWidth: '40px',
                      backgroundColor: index === data.length - 1 ? 'var(--color-primary)' : 'var(--color-accent)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const tooltip = e.currentTarget.previousSibling;
                      if (tooltip) tooltip.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.previousSibling;
                      if (tooltip) tooltip.style.opacity = '0';
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
          {data.map((item, index) => (
            <div key={index} style={{ flex: 1, textCenter: 'center', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render simulated Line Chart
  if (type === 'line') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height, width: '100%', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', flex: 1, position: 'relative', borderBottom: '2px solid var(--color-border)', paddingBottom: '4px' }}>
          
          {/* Simulated grid lines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed var(--color-border)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed var(--color-border)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed var(--color-border)', opacity: 0.5 }} />

          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 }}>
            {data.map((item, index) => {
              const pct = (item.value / maxValue) * 90; // cap at 90% height for padding
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  
                  {/* Circle dot representation */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: `calc(${pct}% - 6px)`,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      border: '2px solid var(--bg-card)',
                      cursor: 'pointer',
                      zIndex: 3
                    }}
                    onMouseEnter={(e) => {
                      const tooltip = e.currentTarget.nextSibling;
                      if (tooltip) tooltip.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.nextSibling;
                      if (tooltip) tooltip.style.opacity = '0';
                    }}
                  />

                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute',
                    bottom: `${pct + 8}%`,
                    backgroundColor: 'var(--color-text)',
                    color: '#FFF',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}>
                    {item.value}{unit}
                  </div>

                  {/* Visual connector line simulation (using gradient or absolute styling if multiple points) */}
                  {index < data.length - 1 && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: `${pct}%`,
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'rgba(231, 111, 81, 0.4)',
                        transformOrigin: '0 0',
                        // Approximate line angle to next point
                        transform: `rotate(${((data[index+1].value - item.value)/maxValue) * -30}deg)`,
                        zIndex: 1
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          {data.map((item, index) => (
            <div key={index} style={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
