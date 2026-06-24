import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Toggle } from '../components/Toggle';
import { 
  Accessibility as AccessibilityIcon, 
  BookOpen, 
  Trash2, 
  Plus, 
  Search,
  CheckCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export const Accessibility = () => {
  const { 
    accessibilitySettings, 
    updateAccessibilitySetting, 
    customDictionary, 
    addCustomWord, 
    deleteCustomWord,
    resetAllData
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const [newCorrection, setNewCorrection] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newCorrection.trim()) {
      setFormError('Please enter both the spoken shortcut and correct spelling.');
      setFormSuccess(false);
      return;
    }

    setFormError('');
    addCustomWord(newShortcut.toLowerCase().trim(), newCorrection.trim());
    setNewShortcut('');
    setNewCorrection('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Filter custom dictionary items
  const dictItems = Object.entries(customDictionary);
  const filteredDict = dictItems.filter(([key, val]) => 
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    val.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <section>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Accessibility & Custom Dictionary
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)' }}>
          Configure your visual, typography, and motion preferences. Manage custom speech corrections to train the AI engine.
        </p>
      </section>

      {/* Main Grid: Settings vs Dictionary */}
      <div className="grid grid-2 gap-3" style={{ alignItems: 'start' }}>
        
        {/* Left Column: Visual Adjustments */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 className="flex align-center gap-2" style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)' }}>
            <AccessibilityIcon size={20} style={{ color: 'var(--color-primary)' }} /> Visual Adjustments
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: '-0.75rem' }}>
            Adjust the application shell colors and typography for optimal reading.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Toggle
              id="large-text"
              label="Large Typography Mode"
              description="Increases font sizes throughout the platform for easier reading."
              checked={accessibilitySettings.largeText}
              onChange={(val) => updateAccessibilitySetting('largeText', val)}
            />
            <Toggle
              id="high-contrast"
              label="High Contrast Color theme"
              description="Swaps interfaces to a stark high-visibility color scheme (dark background, gold highlights)."
              checked={accessibilitySettings.highContrast}
              onChange={(val) => updateAccessibilitySetting('highContrast', val)}
            />
            <Toggle
              id="dyslexia-font"
              label="Dyslexia Friendly Spacing"
              description="Enforces Lexend font family and increases letter-spacing for dyslexic users."
              checked={accessibilitySettings.dyslexiaFont}
              onChange={(val) => updateAccessibilitySetting('dyslexiaFont', val)}
            />
            <Toggle
              id="reduced-motion"
              label="Reduced Motion Mode"
              description="Disables CSS scaling transitions, slide menus, and transcription loading animations."
              checked={accessibilitySettings.reducedMotion}
              onChange={(val) => updateAccessibilitySetting('reducedMotion', val)}
            />
          </div>

          {/* Reset button */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Danger Zone</h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Resetting will clear your LocalStorage cache, erasing training sessions, history, and custom words.
            </p>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all training, history, settings, and custom dictionary mappings? This cannot be undone.")) {
                  resetAllData();
                }
              }}
              className="btn btn-danger"
              style={{ fontSize: 'var(--font-xs)', padding: '6px 12px' }}
            >
              <RotateCcw size={14} /> Clear Cache & Reset All Data
            </button>
          </div>
        </div>

        {/* Right Column: Custom Dictionary manager */}
        <div className="card flex flex-col gap-3">
          <h3 className="flex align-center gap-2" style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)' }}>
            <BookOpen size={20} style={{ color: 'var(--color-accent)' }} /> Personalized Dictionary
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: '-0.75rem' }}>
            Map your specific slurs or word shorthand to complete terms (e.g. <strong>"ggl" &rarr; "Google"</strong>).
          </p>

          {/* Form to add word */}
          <form onSubmit={handleAddWord} className="flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
            <div className="grid grid-2 gap-2">
              <div>
                <input 
                  type="text" 
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="Spoken pattern (e.g. ggl)" 
                  style={{ fontSize: 'var(--font-xs)', padding: '6px 10px' }}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={newCorrection}
                  onChange={(e) => setNewCorrection(e.target.value)}
                  placeholder="Correct word (e.g. Google)" 
                  style={{ fontSize: 'var(--font-xs)', padding: '6px 10px' }}
                />
              </div>
            </div>

            {formError && (
              <span style={{ fontSize: '10px', color: 'var(--color-danger)' }}>{formError}</span>
            )}
            {formSuccess && (
              <span className="flex align-center gap-1" style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 'bold' }}>
                <CheckCircle size={10} /> Mapped successfully!
              </span>
            )}

            <button type="submit" className="btn btn-accent" style={{ fontSize: 'var(--font-xs)', padding: '6px 12px', marginTop: '4px' }}>
              <Plus size={14} /> Add Word Override
            </button>
          </form>

          {/* Mapped word list with search */}
          <div>
            <div className="flex align-center gap-2" style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mapped vocabulary..." 
                style={{ fontSize: 'var(--font-xs)', padding: '6px 10px 6px 30px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              {filteredDict.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>
                  No custom dictionary entries found.
                </div>
              ) : (
                filteredDict.map(([shortcut, correction]) => (
                  <div 
                    key={shortcut} 
                    className="flex justify-between align-center" 
                    style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-xs)' }}
                  >
                    <div>
                      <strong style={{ color: 'var(--color-primary)' }}>"{shortcut}"</strong> &rarr; <strong style={{ color: 'var(--color-text)' }}>"{correction}"</strong>
                    </div>
                    <button 
                      onClick={() => deleteCustomWord(shortcut)}
                      className="btn"
                      style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                      title="Delete map"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
