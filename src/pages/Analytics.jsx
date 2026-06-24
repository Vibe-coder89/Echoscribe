import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateInsights } from '../services/speechEngine';
import { MetricCard } from '../components/MetricCard';
import { ChartMock } from '../components/ChartMock';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Zap, 
  FileText,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Analytics = () => {
  const { history, trainingProgress, rehabStats } = useApp();
  const [timeframe, setTimeframe] = useState('weekly'); // 'daily', 'weekly', 'monthly'

  // Calculate real insights from history
  const insights = generateInsights(history);

  // Timeframe chart datasets
  const chartData = {
    daily: {
      activity: [
        { label: '9 AM', value: 2 },
        { label: '12 PM', value: 5 },
        { label: '3 PM', value: 3 },
        { label: '6 PM', value: 7 },
        { label: '9 PM', value: 4 }
      ],
      accuracy: [
        { label: '9 AM', value: 75 },
        { label: '12 PM', value: 80 },
        { label: '3 PM', value: 82 },
        { label: '6 PM', value: 89 },
        { label: '9 PM', value: 92 }
      ]
    },
    weekly: {
      activity: [
        { label: 'Mon', value: 4 },
        { label: 'Tue', value: 6 },
        { label: 'Wed', value: 8 },
        { label: 'Thu', value: 5 },
        { label: 'Fri', value: 9 },
        { label: 'Sat', value: 12 },
        { label: 'Sun', value: history.length }
      ],
      accuracy: [
        { label: 'Mon', value: 70 },
        { label: 'Tue', value: 73 },
        { label: 'Wed', value: 78 },
        { label: 'Thu', value: 80 },
        { label: 'Fri', value: 83 },
        { label: 'Sat', value: 87 },
        { label: 'Sun', value: insights.averageConfidence || 85 }
      ]
    },
    monthly: {
      activity: [
        { label: 'Week 1', value: 18 },
        { label: 'Week 2', value: 24 },
        { label: 'Week 3', value: 28 },
        { label: 'Week 4', value: 35 }
      ],
      accuracy: [
        { label: 'Week 1', value: 65 },
        { label: 'Week 2', value: 72 },
        { label: 'Week 3', value: 80 },
        { label: 'Week 4', value: insights.averageConfidence || 88 }
      ]
    }
  };

  const selectedActivity = chartData[timeframe].activity;
  const selectedAccuracy = chartData[timeframe].accuracy;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header with Time Selector */}
      <section className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Accessibility Analytics
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)' }}>
            Monitor your training metrics, speech improvement trends, and transcription confidence metrics.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          display: 'flex',
          gap: '2px',
          border: '1px solid var(--color-border)'
        }}>
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className="btn"
              style={{
                fontSize: 'var(--font-xs)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: timeframe === t ? 'var(--color-primary)' : 'transparent',
                color: timeframe === t ? '#FFFFFF' : 'var(--color-text-muted)',
                boxShadow: timeframe === t ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Metrics Cards Grid */}
      <div className="grid grid-4 gap-3">
        <MetricCard
          title="Improvement Score"
          value={`${insights.improvementScore}%`}
          icon={TrendingUp}
          description="Rate of speech clarity increase."
        />
        <MetricCard
          title="Avg Confidence"
          value={`${insights.averageConfidence || 85}%`}
          icon={Sparkles}
          description="Model's speech prediction reliability."
        />
        <MetricCard
          title="Success Rate"
          value={`${insights.successRate || 92}%`}
          icon={CheckCircle}
          description="Transcripts requiring zero adjustments."
        />
        <MetricCard
          title="Training Progress"
          value={`${trainingProgress.readinessScore}%`}
          icon={Zap}
          description="Completed phoneme voice profiles."
        />
      </div>

      {/* Charts Display */}
      <div className="grid grid-2 gap-3">
        
        {/* Chart 1: Accuracy Curve */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Speech Clarity & Accuracy curve
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Historical transcription matching correctness percentages.
          </p>
          <ChartMock type="line" data={selectedAccuracy} height={200} />
        </div>

        {/* Chart 2: Session Activity count */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Transcription Activity
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Total translation requests processed.
          </p>
          <ChartMock type="bar" data={selectedActivity} height={200} unit=" tx" />
        </div>

      </div>

      {/* Insights Panel */}
      <div className="grid grid-3 gap-3" style={{ alignItems: 'start' }}>
        
        {/* Core Insights card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
            EchoScribe Speech Insights
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex gap-3 align-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
              <div style={{ fontSize: 'var(--font-sm)', flex: 1 }}>
                Your clarity score increased by <strong>8%</strong> after training the <strong>"opl yutub"</strong> voice token.
              </div>
            </div>

            <div className="flex gap-3 align-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ fontSize: 'var(--font-sm)', flex: 1 }}>
                Fuzzy matching is resolving <strong>{insights.successRate}%</strong> of transcripts correctly on the first attempt.
              </div>
            </div>

            <div className="flex gap-3 align-center" style={{ padding: '0.5rem 0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
              <div style={{ fontSize: 'var(--font-sm)', flex: 1 }}>
                Model readiness is at <strong>{trainingProgress.readinessScore}%</strong>. Training 4 more essential commands is recommended to unlock peak efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* Common Corrections frequency card */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
            Common Adjustments
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Most frequently corrected spoken shortcuts.
          </p>

          {insights.commonCorrections.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
              No corrections recorded. Use Live Translation to begin profiling.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.commonCorrections.map((item, idx) => (
                <div key={idx} className="flex justify-between align-center" style={{ fontSize: 'var(--font-sm)', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontWeight: 500 }}>"{item.phrase}"</span>
                  <span className="badge badge-success">{item.count} times</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
