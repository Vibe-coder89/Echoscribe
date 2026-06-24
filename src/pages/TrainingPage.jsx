import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhraseCard } from '../components/PhraseCard';
import { MetricCard } from '../components/MetricCard';
import { trainModel } from '../services/speechEngine';
import { 
  Mic, 
  Square, 
  Check, 
  HelpCircle, 
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const TRAINING_PHRASES = [
  { phrase: "hlp me", correction: "Help me", category: "Essential", hint: "Requesting assistance" },
  { phrase: "cl mom", correction: "Call Mom", category: "Essential", hint: "Calling family" },
  { phrase: "opn gmail", correction: "Open Gmail", category: "Utility", hint: "Opening browser apps" },
  { phrase: "yt musc", correction: "YouTube Music", category: "Entertainment", hint: "Music control" },
  { phrase: "opl yutub", correction: "Open YouTube", category: "Entertainment", hint: "Video control" },
  { phrase: "nd wtr", correction: "Need water", category: "Essential", hint: "Basic needs" },
  { phrase: "go out", correction: "Go outside", category: "Utility", hint: "Locomotion" },
  { phrase: "tly v", correction: "Turn on TV", category: "Utility", hint: "Home automation" },
  { phrase: "lghts", correction: "Turn on lights", category: "Utility", hint: "Home automation" },
  { phrase: "ggl", correction: "Google", category: "Utility", hint: "Search assistant" },
  { phrase: "meds", correction: "Take medicine", category: "Essential", hint: "Healthcare" },
  { phrase: "slp", correction: "I want to sleep", category: "Essential", hint: "Basic needs" }
];

export const TrainingPage = () => {
  const { trainingProgress, recordTrainingSample, customDictionary, addCustomWord } = useApp();
  const [selectedPhrase, setSelectedPhrase] = useState(TRAINING_PHRASES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(''); // 'training', 'done', ''
  const [customInput, setCustomInput] = useState('');
  const [customCorrection, setCustomCorrection] = useState('');
  const [customError, setCustomError] = useState('');

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordingDone(false);
    setTrainingStatus('');
    
    // Simulate a 3-second audio recording
    setTimeout(() => {
      setIsRecording(false);
      setRecordingDone(true);
    }, 3000);
  };

  const handleSubmitSample = async () => {
    if (!recordingDone) return;
    
    setTrainingStatus('training');
    
    // Simulate engine training
    const result = await trainModel(selectedPhrase.phrase, selectedPhrase.correction);
    
    if (result.success) {
      recordTrainingSample(selectedPhrase.phrase, selectedPhrase.correction);
      setTrainingStatus('done');
      setRecordingDone(false);
      
      // Auto advance to next untrained phrase if available
      setTimeout(() => {
        const nextUntrained = TRAINING_PHRASES.find(
          p => p.phrase !== selectedPhrase.phrase && !trainingProgress.completedPhrases.includes(p.phrase)
        );
        if (nextUntrained) {
          setSelectedPhrase(nextUntrained);
          setTrainingStatus('');
        }
      }, 2000);
    }
  };

  const handleAddCustomPhrase = (e) => {
    e.preventDefault();
    if (!customInput || !customCorrection) {
      setCustomError('Please fill in both fields.');
      return;
    }
    setCustomError('');
    addCustomWord(customInput, customCorrection);
    
    // Add custom phrase to training selection list
    const newPhraseObj = {
      phrase: customInput.toLowerCase().trim(),
      correction: customCorrection.trim(),
      category: "Custom",
      hint: "User defined dictionary entry"
    };

    // Train immediately for custom phrase
    recordTrainingSample(newPhraseObj.phrase, newPhraseObj.correction);
    setSelectedPhrase(newPhraseObj);
    setCustomInput('');
    setCustomCorrection('');
    setRecordingDone(false);
    setTrainingStatus('done');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Page Header */}
      <section>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Speech Pattern Training
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)' }}>
          Help EchoScribe adapt to your voice. Select a phrase, record your natural pronunciation, and match it to its target meaning.
        </p>
      </section>

      {/* Stats row */}
      <div className="grid grid-3 gap-3">
        <MetricCard
          title="Trained Phrases"
          value={`${trainingProgress.completedPhrases.length} / 12`}
          progress={Math.round((trainingProgress.completedPhrases.length / 12) * 100)}
          description="Standard bank phrase templates completed."
        />
        <MetricCard
          title="Voice Samples"
          value={trainingProgress.samplesCollected}
          description="Total recorded audio recordings stored locally."
        />
        <MetricCard
          title="Confidence Score"
          value={`${trainingProgress.confidenceEstimate}%`}
          description="Estimated accuracy score of phonetic mapping."
        />
      </div>

      {/* Main split: Selector vs Action Center */}
      <div className="grid grid-2 gap-3" style={{ alignItems: 'start' }}>
        
        {/* Left: Phrase Bank */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex justify-between align-center">
            <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)' }}>
              Phrase Templates
            </h3>
            <span className="badge badge-success">Target: 12 Phrases</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
            {TRAINING_PHRASES.map((item) => {
              const isCompleted = trainingProgress.completedPhrases.includes(item.phrase);
              const isActive = selectedPhrase.phrase === item.phrase;

              return (
                <PhraseCard
                  key={item.phrase}
                  phrase={item.phrase}
                  category={item.category}
                  hint={item.hint}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  onClick={() => {
                    setSelectedPhrase(item);
                    setRecordingDone(false);
                    setTrainingStatus('');
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Recording Area & Custom Add */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card: Recording Session */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
              Training Studio
            </h3>

            {/* Instruction */}
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-border)'
            }}>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Pronounce normally:
              </p>
              <h2 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                "{selectedPhrase.phrase}"
              </h2>
              <div className="flex align-center gap-1" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                <ArrowRight size={16} /> Means: <strong>"{selectedPhrase.correction}"</strong>
              </div>
            </div>

            {/* Live simulator controls */}
            <div className="flex flex-col align-center justify-center gap-3" style={{ padding: '1.5rem 0', minHeight: '160px' }}>
              {isRecording ? (
                <div className="flex flex-col align-center gap-2">
                  <div className="flex align-center gap-1" style={{ height: '40px' }}>
                    <span className="wave-bar" />
                    <span className="wave-bar" style={{ height: '40px' }} />
                    <span className="wave-bar" style={{ height: '60px' }} />
                    <span className="wave-bar" style={{ height: '50px' }} />
                    <span className="wave-bar" style={{ height: '30px' }} />
                    <span className="wave-bar" />
                  </div>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)', fontWeight: 'bold' }} className="pulse">
                    Recording audio... speak now
                  </span>
                </div>
              ) : recordingDone ? (
                <div className="flex flex-col align-center gap-2">
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(42, 157, 143, 0.1)', 
                    color: 'var(--color-accent)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Check size={32} />
                  </div>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                    Voice sample collected!
                  </span>
                </div>
              ) : trainingStatus === 'training' ? (
                <div className="flex flex-col align-center gap-2">
                  <div className="pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 1s infinite linear' }} />
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                    Updating speech alignment matrix...
                  </span>
                </div>
              ) : trainingStatus === 'done' ? (
                <div className="flex flex-col align-center gap-2 text-center" style={{ maxWidth: '300px' }}>
                  <div style={{ color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                    <Sparkles size={36} />
                  </div>
                  <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 'bold' }}>Training Successful!</h4>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    "Great progress. EchoScribe is beginning to understand your communication style."
                  </p>
                </div>
              ) : (
                <button 
                  onClick={handleStartRecord}
                  className="btn btn-primary"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(231, 111, 81, 0.2)'
                  }}
                >
                  <Mic size={36} />
                  <span style={{ fontSize: '10px', marginTop: '4px' }}>Record</span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-between" style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleStartRecord}
                className="btn btn-secondary"
                disabled={isRecording || trainingStatus === 'training'}
                style={{ flex: 1 }}
              >
                {recordingDone ? 'Re-record' : 'Record sample'}
              </button>
              <button 
                onClick={handleSubmitSample}
                className="btn btn-accent"
                disabled={!recordingDone || trainingStatus === 'training'}
                style={{ flex: 1 }}
              >
                Submit to Model
              </button>
            </div>
          </div>

          {/* Card: Add Custom Dictionary Phrase */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
              Teach a Custom Word
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Do you have a specific way you pronounce a family name, smart assistant command, or favorite hobby? Map it here.
            </p>

            <form onSubmit={handleAddCustomPhrase} className="flex flex-col gap-3">
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  How you say it (slur / shortcut):
                </label>
                <input 
                  type="text" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. ggl" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  What it actually means:
                </label>
                <input 
                  type="text" 
                  value={customCorrection}
                  onChange={(e) => setCustomCorrection(e.target.value)}
                  placeholder="e.g. Google" 
                />
              </div>

              {customError && (
                <div style={{ display: 'flex', alignCenter: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--color-danger)' }}>
                  <AlertCircle size={14} /> {customError}
                </div>
              )}

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                <BookOpen size={16} /> Teach Phrase Instantly
              </button>
            </form>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
