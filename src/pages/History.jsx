import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Trash2, 
  Download, 
  Calendar, 
  Sparkles, 
  Filter, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const History = () => {
  const { history, deleteTranscription, clearHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all'); // 'all', 'exact', 'phonetic', 'fuzzy', 'fallback'
  const [filterConfidence, setFilterConfidence] = useState('all'); // 'all', 'high' (>=90), 'low' (<90)

  // Search & Filter Logic
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.corrected.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = filterMethod === 'all' || item.method === filterMethod;
    
    let matchesConfidence = true;
    if (filterConfidence === 'high') {
      matchesConfidence = item.confidence >= 90;
    } else if (filterConfidence === 'low') {
      matchesConfidence = item.confidence < 90;
    }

    return matchesSearch && matchesMethod && matchesConfidence;
  });

  const handleExport = () => {
    if (history.length === 0) return;
    
    // Create a JSON blob and trigger download in client
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(history, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `echoscribe_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <section className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Translation History Logs
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)' }}>
            Review, filter, and export the database of all translation sessions captured by the speech engine.
          </p>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            disabled={history.length === 0}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--font-sm)' }}
          >
            <Download size={16} /> Export Logs (JSON)
          </button>
          <button 
            onClick={clearHistory}
            disabled={history.length === 0}
            className="btn btn-danger"
            style={{ fontSize: 'var(--font-sm)' }}
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </section>

      {/* Filter and Search controls bar */}
      <section className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="flex justify-between align-center gap-3" style={{ flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <div className="flex align-center gap-2" style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcriptions by keyword..." 
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Selector filters */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <div className="flex align-center gap-1">
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 'bold', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Method:
              </span>
              <select 
                value={filterMethod} 
                onChange={(e) => setFilterMethod(e.target.value)}
                style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', width: 'auto' }}
              >
                <option value="all">All Methods</option>
                <option value="exact">Exact Match</option>
                <option value="phonetic">Phonetic</option>
                <option value="fuzzy">Fuzzy Match</option>
                <option value="fallback">Fallback</option>
              </select>
            </div>

            <div className="flex align-center gap-1">
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 'bold', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Confidence:
              </span>
              <select 
                value={filterConfidence} 
                onChange={(e) => setFilterConfidence(e.target.value)}
                style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', width: 'auto' }}
              >
                <option value="all">All Ratings</option>
                <option value="high">High (&ge; 90%)</option>
                <option value="low">Low (&lt; 90%)</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* Database Listing */}
      <section className="card" style={{ padding: '1.5rem 2rem' }}>
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col align-center justify-center gap-2" style={{ padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={36} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 'bold' }}>No transcripts found</h3>
            <p style={{ fontSize: 'var(--font-xs)', textAlign: 'center' }}>
              Adjust your search keywords / filter options, or translate new inputs on the Live Translation screen.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredHistory.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--bg-secondary)',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                {/* Text logs */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div className="flex align-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary flex align-center gap-1" style={{ fontSize: '10px' }}>
                      <Calendar size={10} />
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`badge ${item.confidence >= 90 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                      {item.confidence}% confidence
                    </span>
                    <span className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: '10px', backgroundColor: 'rgba(42, 157, 143, 0.08)', color: 'var(--color-accent)' }}>
                      Method: {item.method}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                      Original speech input: <strong style={{ color: 'var(--color-text)' }}>"{item.original}"</strong>
                    </div>
                    <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--color-accent)' }}>
                      Corrected Output: <span style={{ color: 'var(--color-text)' }}>"{item.corrected}"</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <button 
                    onClick={() => deleteTranscription(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', borderStyle: 'none', color: 'var(--color-danger)' }}
                    title="Delete transcription"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
