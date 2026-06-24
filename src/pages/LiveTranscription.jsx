import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { predictCorrection, generateInsights } from '../services/speechEngine';
import { 
  Mic, 
  Sparkles, 
  Copy, 
  Check, 
  Save, 
  Volume2, 
  Play, 
  Pause, 
  Square,
  Edit2, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Activity,
  History,
  Trash2
} from 'lucide-react';

const SCENARIOS = {
  dysarthria: {
    name: "Dysarthria (Slurred Speech)",
    description: "Simulates phonetically shifted, shortened, or slurred consonants common in motor speech disorders.",
    presets: [
      { raw: "cl mom", target: "Call Mom" },
      { raw: "nd wtr", target: "Need water" },
      { raw: "hlp me", target: "Help me" },
      { raw: "hungry", target: "I am hungry" },
      { raw: "slp", target: "I want to sleep" }
    ]
  },
  stroke: {
    name: "Stroke Recovery (Fragmented)",
    description: "Simulates simplified syntax, single-word requests, and phonetic shortcuts typical of speech recovery.",
    presets: [
      { raw: "meds", target: "Take medicine" },
      { raw: "bath", target: "Need to use restroom" },
      { raw: "plz hlp", target: "Please help" },
      { raw: "yes", target: "Yes" },
      { raw: "no", target: "No" }
    ]
  },
  stuttering: {
    name: "Severe Stuttering (Repetitive)",
    description: "Simulates initial character and syllable repetitions that the speech engine automatically filters.",
    presets: [
      { raw: "H-h-h-hello", target: "Hello" },
      { raw: "w-w-w-water", target: "Water" },
      { raw: "p-p-please help", target: "Please help" },
      { raw: "t-t-turn on lights", target: "Turn on lights" }
    ]
  },
  accent: {
    name: "Regional Accent / Pronunciation",
    description: "Simulates non-standard phonetic spelling and pronunciation patterns adapted over time.",
    presets: [
      { raw: "opl yutub", target: "Open YouTube" },
      { raw: "yt musc", target: "YouTube Music" },
      { raw: "ggl", target: "Google" },
      { raw: "tly v", target: "Turn on TV" }
    ]
  }
};

export const LiveTranscription = () => {
  const { 
    customDictionary, 
    addTranscription, 
    addCustomWord, 
    history, 
    deleteTranscription, 
    clearHistory 
  } = useApp();
  
  // Responsive hook state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Core States
  const [isInitializing, setIsInitializing] = useState(true);
  const [status, setStatus] = useState('stopped'); // 'stopped', 'listening', 'paused', 'processing'
  const [transcriptSession, setTranscriptSession] = useState([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('stuttering');
  const [simulatorCustomInput, setSimulatorCustomInput] = useState('');
  
  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editOriginal, setEditOriginal] = useState('');
  const [editValue, setEditValue] = useState('');
  const [learnedAlert, setLearnedAlert] = useState(null);

  // Microphone & SpeechRecognition States
  const [interimRawText, setInterimRawText] = useState('');
  const [micPermission, setMicPermission] = useState('granted');
  const [browserSupport, setBrowserSupport] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [lastReceivedTranscript, setLastReceivedTranscript] = useState(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastSpeechEvent, setLastSpeechEvent] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState('');

  // Mount console log and initial check
  useEffect(() => {
    console.log("Live Mode Mounted");
    console.log("Route Loaded");
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Speech Recognition Initialized console log
  useEffect(() => {
    if (browserSupport) {
      console.log("Speech Recognition Initialized");
    }
  }, [browserSupport]);

  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  
  // Use a Ref to keep customDictionary up to date without triggering SpeechRecognition recreate
  const customDictionaryRef = useRef(customDictionary);
  useEffect(() => {
    customDictionaryRef.current = customDictionary;
  }, [customDictionary]);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statusRef = useRef(status);
  const processRawSpeechRef = useRef(processRawSpeech);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    processRawSpeechRef.current = processRawSpeech;
  }, [processRawSpeech]);

  // Setup Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setBrowserSupport(!!SpeechRecognition);

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true; // Enable interim results for real-time display
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setLastError(null);
        console.log("Recognition Started");
        console.log("Browser:", navigator.userAgent);
        console.log("Online:", navigator.onLine);
        console.log("Location:", window.location.href);
        console.log("Recognition Instance:", recognitionRef.current);
      };

      rec.onresult = (event) => {
        console.log("Speech event received");
        console.log(event);

        const extractedTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("");

        console.log("Recognition Result", extractedTranscript);
        setTranscript(extractedTranscript);
        console.log("Transcript State Updated");

        setLastSpeechEvent({
          type: event.type,
          timestamp: new Date().toLocaleTimeString(),
          resultsLength: event.results.length,
          isFinal: event.results[event.results.length - 1]?.isFinal,
          rawTranscript: extractedTranscript
        });

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setInterimRawText(interimTranscript);
        }

        if (finalTranscript) {
          setInterimRawText('');
          processRawSpeechRef.current(finalTranscript);
        }
      };

      rec.onerror = (event) => {
        console.log("Speech Error Event:", event);
        console.log("Error:", event.error);
        console.log("Message:", event.message);

        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          setLastError("Permission denied: Microphone access was blocked by the user or system.");
          setStatus('stopped');
        } else if (event.error === 'no-speech') {
          console.warn("Speech Recognition: No speech detected.");
        } else if (event.error === 'network') {
          setLastError("Network error: Please verify your internet connection.");
        } else {
          setLastError(`Speech Recognition error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        console.log("Recognition Ended");
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.isActive = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []); // Run on mount once

  // Handle auto-scroll of transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptSession, interimRawText]);

  function processRawSpeech(rawText) {
    if (!rawText.trim()) return;
    
    setStatus('processing');
    
    // No fake timers, process instantly
    const result = predictCorrection(rawText, customDictionaryRef.current);
    const newEntry = {
      id: 'tx_live_' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      original: rawText,
      corrected: result.corrected,
      confidence: result.confidence,
      method: result.method
    };
    
    setTranscriptSession(prev => [...prev, newEntry]);
    setLastReceivedTranscript({
      raw: rawText,
      corrected: result.corrected,
      confidence: result.confidence,
      timestamp: new Date().toLocaleTimeString()
    });
    setStatus('listening');
    setSaved(false);
    setCopied(false);
  }

  const handleStartListening = () => {
    setSaved(false);
    setLastError(null);

    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLastError("Your browser does not support the Web Speech API. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    // Start recognition if available
    if (recognitionRef.current) {
      recognitionRef.current.isActive = true;
      if (!isListening) {
        try {
          console.log("Calling recognitionRef.current.start()");
          recognitionRef.current.start();
          setStatus('listening');
        } catch (e) {
          console.warn("SpeechRecognition start exception:", e);
        }
      } else {
        console.log("Speech recognition is already listening, skipping duplicate start.");
      }
    } else {
      console.log("No recognitionRef.current available to start");
      setStatus('listening');
    }
  };

  const handleRunDiagnostic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log("SpeechRecognition:", SpeechRecognition);
    if (!SpeechRecognition) {
      setDiagnosticResult("SpeechRecognition API NOT supported in this browser.");
    } else {
      setDiagnosticResult("SpeechRecognition API supported. Type: " + SpeechRecognition.name);
    }
  };

  const handleRunSpeechTest = () => {
    console.log("--- STANDALONE SPEECH TEST STARTING ---");
    console.log("Browser:", navigator.userAgent);
    console.log("Online:", navigator.onLine);
    console.log("Location:", window.location.href);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("SpeechTest: SpeechRecognition NOT supported.");
      return;
    }

    try {
      const testRec = new SpeechRecognition();
      testRec.continuous = true;
      testRec.interimResults = true;
      testRec.lang = "en-US";
      testRec.maxAlternatives = 1;

      testRec.onstart = () => {
        console.log("SpeechTest Event: onstart");
      };

      testRec.onresult = (event) => {
        console.log("SpeechTest Event: onresult", event);
        const transcriptText = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("");
        console.log("SpeechTest Transcript:", transcriptText);
      };

      testRec.onerror = (event) => {
        console.log("SpeechTest Event: onerror", event);
        console.log("SpeechTest Error:", event.error);
        console.log("SpeechTest Message:", event.message);
      };

      testRec.onend = () => {
        console.log("SpeechTest Event: onend");
      };

      console.log("SpeechTest: calling testRec.start()");
      testRec.start();
    } catch (e) {
      console.error("SpeechTest exception during setup/start:", e);
    }
  };

  const handleStopListening = () => {
    setStatus('stopped');
    if (recognitionRef.current) {
      recognitionRef.current.isActive = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
  };

  const handlePauseListening = () => {
    setStatus('paused');
    if (recognitionRef.current) {
      recognitionRef.current.isActive = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
  };

  const handleClearTranscript = () => {
    setTranscriptSession([]);
    setInterimRawText('');
    setTranscript('');
    setSaved(false);
    setCopied(false);
  };

  const handleSimulateSpeech = (rawText) => {
    processRawSpeech(rawText);
  };

  const handleSpeakLastOutput = () => {
    if (!latestCorrected) return;
    handleSpeakText(latestCorrected);
  };

  const handleSpeakText = (text) => {
    if (!text) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  const handleCopy = () => {
    const fullText = transcriptSession.map(item => item.corrected).join('\n');
    if (!fullText) return;
    navigator.clipboard.writeText(fullText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy transcript:", err);
      });
  };

  const handleSaveSession = () => {
    if (transcriptSession.length === 0) return;
    transcriptSession.forEach(item => {
      addTranscription(item.original, item.corrected, item.confidence, item.method);
    });
    setSaved(true);
    setLearnedAlert({ raw: "Session", corrected: "saved to History Logs successfully!" });
    setTimeout(() => setLearnedAlert(null), 3000);
  };

  const handleStartEditing = (item) => {
    setEditingId(item.id);
    setEditOriginal(item.original);
    setEditValue(item.corrected);
  };

  const handleSaveCorrection = () => {
    if (!editValue.trim() || !editingId) return;
    setTranscriptSession(prev => prev.map(item => {
      if (item.id === editingId) {
        addCustomWord(item.original, editValue);
        setLearnedAlert({ raw: item.original, corrected: editValue });
        setTimeout(() => setLearnedAlert(null), 3500);
        return {
          ...item,
          corrected: editValue,
          method: 'custom_override',
          confidence: 100
        };
      }
      return item;
    }));
    setEditingId(null);
    setEditValue('');
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'listening':
        return {
          label: 'LIVE - LISTENING...',
          color: 'var(--color-success)',
          bgColor: 'rgba(42, 157, 143, 0.12)',
          pulse: true
        };
      case 'paused':
        return {
          label: 'PAUSED',
          color: 'var(--color-warning)',
          bgColor: 'rgba(233, 196, 106, 0.12)',
          pulse: true
        };
      case 'processing':
        return {
          label: 'PROCESSING SPEECH...',
          color: 'var(--color-primary)',
          bgColor: 'rgba(231, 111, 81, 0.12)',
          pulse: true
        };
      case 'stopped':
      default:
        return {
          label: 'MIC MUTED',
          color: 'var(--color-text-muted)',
          bgColor: 'var(--bg-secondary)',
          pulse: false
        };
    }
  };


  const statusDisplay = getStatusDisplay();
  const latestCorrected = transcriptSession.length > 0 ? transcriptSession[transcriptSession.length - 1].corrected : '';
  const insights = generateInsights(history);

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#EAECEF',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #D1D5DB'
        }}>
          <h2>Live Mode Loaded Successfully</h2>
        </div>
        <div className="pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
          <Mic size={32} className="pulse" />
          <h2 style={{ fontFamily: 'var(--font-display)' }}>Initializing microphone...</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
          Setting up speech recognition and checking permissions...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // MOBILE ONE-HANDED VIEW
  // ----------------------------------------------------
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', gap: '1rem', position: 'relative' }}>
        
        {/* Toast Learner Alert */}
        {learnedAlert && (
          <div className="card" style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '4px solid var(--color-accent)',
            padding: '0.85rem 1.25rem',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <CheckCircle size={18} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text)' }}>
              Learned: "{learnedAlert.raw}" &rarr; <strong>"{learnedAlert.corrected}"</strong>
            </span>
          </div>
        )}

        {/* Error Alert Display */}
        {lastError && (
          <div style={{
            backgroundColor: 'rgba(217, 4, 41, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: 'var(--color-danger)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            margin: '0 10px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={14} /> {lastError}
            </span>
            <button 
              onClick={() => setLastError(null)} 
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Status Indicator Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: statusDisplay.bgColor,
            color: statusDisplay.color,
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: `1px solid ${statusDisplay.color}`
          }} className={statusDisplay.pulse ? 'pulse' : ''}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusDisplay.color }} />
            {statusDisplay.label}
          </div>

          {/* Waveform visual indicator */}
          {(status === 'listening' || status === 'processing') && (
            <div className="flex align-center">
              <span className="wave-bar" style={{ height: '12px' }} />
              <span className="wave-bar" style={{ height: '18px' }} />
              <span className="wave-bar" style={{ height: '12px' }} />
            </div>
          )}
        </div>

        {/* Large Readable Transcript Display Area */}
        <div className="card flex flex-col justify-center align-center" style={{
          flex: 1,
          border: '2px solid var(--color-accent)',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto'
        }}>
          {transcript || latestCorrected || interimRawText ? (
            <div style={{ width: '100%' }}>
              <h1 style={{
                fontSize: '2rem',
                lineHeight: '1.3',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                fontWeight: '800',
                wordBreak: 'break-word',
                margin: 0
              }}>
                {transcript || (interimRawText ? (
                  <span style={{ color: 'var(--color-text-muted)', opacity: 0.8 }}>{interimRawText}</span>
                ) : (
                  latestCorrected
                ))}
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--color-accent)', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>
                {interimRawText ? 'Capturing Speech Live...' : 'Translated in real-time'}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Tap the large mic button below and start speaking...
            </span>
          )}
        </div>

        {/* Developer Debug Accordion */}
        <details style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '11px'
        }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
            Show Developer Debug Panel
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Web Speech API Support:</span>
              <strong style={{ color: browserSupport ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {browserSupport ? 'Supported' : 'Not Supported'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Microphone Permission:</span>
              <strong style={{ color: micPermission === 'granted' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {micPermission.toUpperCase()}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Is listening:</span>
              <strong>{isListening ? 'Yes' : 'No'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recognition status:</span>
              <strong>{status.toUpperCase()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Current transcript:</span>
              <strong>"{transcript || 'None'}"</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--color-border)', paddingTop: '4px' }}>
              <span>Last speech event:</span>
              <pre style={{ fontSize: '9px', margin: 0, overflowX: 'auto', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                {lastSpeechEvent ? JSON.stringify(lastSpeechEvent, null, 2) : 'None'}
              </pre>
            </div>
            {lastError && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                <span>Last Error:</span>
                <strong>{lastError}</strong>
              </div>
            )}
            {lastReceivedTranscript && (
              <div style={{ marginTop: '4px', padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <strong>Last Transcript:</strong>
                <div>Raw: "{lastReceivedTranscript.raw}"</div>
                <div>Corrected: "{lastReceivedTranscript.corrected}"</div>
              </div>
            )}
            {diagnosticResult && (
              <div style={{ marginTop: '4px', padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--color-border)', fontStyle: 'italic', wordBreak: 'break-all' }}>
                {diagnosticResult}
              </div>
            )}
            <button 
              onClick={handleRunDiagnostic} 
              className="btn btn-secondary" 
              style={{ fontSize: '10px', padding: '4px 8px', marginTop: '6px', cursor: 'pointer' }}
            >
              Run Diagnostic
            </button>
          </div>
        </details>

        {/* Collapsible Simulator Details (Accordion) */}
        <details style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--font-xs)'
        }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
            Show Pattern Scenario Simulator
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {Object.entries(SCENARIOS).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  style={{
                    fontSize: '9px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    backgroundColor: selectedScenario === key ? 'var(--color-primary)' : 'var(--bg-card)',
                    color: selectedScenario === key ? '#FFF' : 'var(--color-text)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {data.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {SCENARIOS[selectedScenario].presets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handleSimulateSpeech(preset.raw)}
                  style={{ fontSize: '9px', padding: '3px 6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                >
                  "{preset.raw}" &rarr;
                </button>
              ))}
            </div>
          </div>
        </details>

        {/* One-handed Button Actions Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginTop: 'auto' }}>
          
          {/* Big Microphone button: Target 100px */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {status === 'listening' ? (
              <button 
                onClick={handleStopListening}
                className="pulse"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-danger)',
                  border: '6px solid var(--bg-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-lg)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  gap: '2px',
                  outline: 'none'
                }}
              >
                <Square size={24} fill="#FFF" />
                <span>STOP</span>
              </button>
            ) : (
              <button 
                onClick={handleStartListening}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  border: '6px solid var(--bg-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-lg)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  gap: '2px',
                  outline: 'none'
                }}
              >
                <Mic size={24} />
                <span>TALK</span>
              </button>
            )}

            {/* Clear Transcript Button for Mobile */}
            {(transcriptSession.length > 0 || interimRawText) && (
              <button 
                onClick={handleClearTranscript}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} /> Clear Transcript
              </button>
            )}
          </div>

          {/* Action buttons with comfortable touch targets (>= 48px height) */}
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <button
              onClick={handleSpeakLastOutput}
              disabled={!latestCorrected}
              className="btn btn-accent"
              style={{ flex: 1, height: '48px', padding: 0, borderRadius: 'var(--radius-md)', fontSize: '12px' }}
            >
              <Volume2 size={16} /> Speak
            </button>
            
            <button
              onClick={handleCopy}
              disabled={transcriptSession.length === 0}
              className="btn btn-secondary"
              style={{ flex: 1, height: '48px', padding: 0, borderRadius: 'var(--radius-md)', fontSize: '12px' }}
            >
              {copied ? <Check size={16} style={{ color: 'var(--color-accent)' }} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleSaveSession}
              disabled={transcriptSession.length === 0 || saved}
              className="btn btn-secondary"
              style={{ flex: 1, height: '48px', padding: 0, borderRadius: 'var(--radius-md)', fontSize: '12px' }}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ----------------------------------------------------
  // DESKTOP SPLIT-SCREEN VIEW
  // ----------------------------------------------------
  return (
    <>
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#EAECEF',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <h2>Live Mode Loaded Successfully</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '2rem', height: 'calc(100vh - 180px)', minHeight: '520px' }}>
      
      {/* Toast Notification */}
      {learnedAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '4px solid var(--color-accent)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '400px'
        }}>
          <CheckCircle size={20} style={{ color: 'var(--color-accent)' }} />
          <div>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', color: 'var(--color-text-muted)' }}>
              EchoScribe Learned Correction
            </span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
              "{learnedAlert.raw}" will now correct to <strong>"{learnedAlert.corrected}"</strong>
            </span>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: SPEECH TRANSLATION PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {/* Error Alert Display */}
        {lastError && (
          <div className="card" style={{
            backgroundColor: 'rgba(217, 4, 41, 0.08)',
            borderLeft: '4px solid var(--color-danger)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div className="flex align-center gap-2" style={{ color: 'var(--color-danger)' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{lastError}</span>
            </div>
            <button 
              onClick={() => setLastError(null)}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--font-xs)', padding: '4px 8px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Microphone Status Bar */}
        <section className="card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex align-center gap-3">
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusDisplay.bgColor,
              color: statusDisplay.color,
              fontSize: 'var(--font-xs)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: `1px solid ${statusDisplay.color}`
            }} className={statusDisplay.pulse ? 'pulse' : ''}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusDisplay.color }} />
              {statusDisplay.label}
            </div>
            
            {/* Waveform visual indicator */}
            {(status === 'listening' || status === 'processing') && (
              <div className="flex align-center">
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
            )}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
            {browserSupport ? "Speech Recognition API Available" : "Web Speech API Not Supported"}
          </div>
        </section>

        {/* Speech Simulator Panel */}
        <section className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} /> Speech Scenario Simulator
            </h4>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
              Simulate speech behaviors by clicking words:
            </span>
          </div>
          
          <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {Object.entries(SCENARIOS).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key)}
                className="btn"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedScenario === key ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: selectedScenario === key ? '#FFF' : 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {data.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between align-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', flex: 1 }}>
              {SCENARIOS[selectedScenario].description}
            </div>
            
            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              {SCENARIOS[selectedScenario].presets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handleSimulateSpeech(preset.raw)}
                  className="btn btn-secondary"
                  style={{ fontSize: '10px', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
                >
                  Speak "{preset.raw}"
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
            <input
              type="text"
              value={simulatorCustomInput}
              onChange={(e) => setSimulatorCustomInput(e.target.value)}
              placeholder="Or enter shorthand here..."
              style={{ fontSize: 'var(--font-xs)', padding: '6px 10px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSimulateSpeech(simulatorCustomInput);
                  setSimulatorCustomInput('');
                }
              }}
            />
            <button
              onClick={() => {
                handleSimulateSpeech(simulatorCustomInput);
                setSimulatorCustomInput('');
              }}
              disabled={!simulatorCustomInput.trim()}
              className="btn btn-accent"
              style={{ fontSize: 'var(--font-xs)', padding: '6px 12px' }}
            >
              Simulate
            </button>
          </div>
        </section>

        {/* Side-by-Side: Raw Speech & Corrected Speech Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>
          
          {/* Raw Speech Feed */}
          <div className="card flex flex-col" style={{ minHeight: '180px', maxHeight: '260px', overflow: 'hidden', padding: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              Raw Speech Input
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transcriptSession.length === 0 && !interimRawText && !transcript ? (
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  Awaiting microphone capture...
                </span>
              ) : (
                <>
                  {transcript && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(231, 111, 81, 0.05)',
                      border: '1px solid var(--color-primary)',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-text)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {transcript}
                    </div>
                  )}
                  {transcriptSession.map((item) => (
                    <div key={item.id} style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-text-muted)'
                    }}>
                      "{item.original}"
                    </div>
                  ))}
                  {interimRawText && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(231, 111, 81, 0.05)',
                      border: '1px dashed var(--color-primary)',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-primary)',
                      fontStyle: 'italic'
                    }} className="pulse">
                      "{interimRawText}" (speaking...)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Corrected Speech Logs */}
          <div className="card flex flex-col" style={{ minHeight: '180px', maxHeight: '260px', overflow: 'hidden', padding: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
              Corrected Output Logs
            </h3>
            
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transcriptSession.length === 0 ? (
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No corrected transcripts.
                </span>
              ) : (
                transcriptSession.map((item) => {
                  const isEditing = editingId === item.id;
                  
                  return (
                    <div key={item.id} style={{
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(42, 157, 143, 0.05)',
                      border: '1px solid var(--color-accent)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}>
                      <div className="flex justify-between align-center">
                        <span className="badge badge-success" style={{ fontSize: '8px', padding: '1px 5px' }}>
                          {item.confidence}% Match
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: '8px', padding: '1px 5px', textTransform: 'capitalize' }}>
                          {item.method}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ fontSize: 'var(--font-xs)', padding: '4px', height: '50px' }}
                          />
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ fontSize: '9px', padding: '2px 6px' }}>Cancel</button>
                            <button onClick={handleSaveCorrection} className="btn btn-accent" style={{ fontSize: '9px', padding: '2px 6px' }}>Save Override</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 'bold', color: 'var(--color-text)' }}>
                            "{item.corrected}"
                          </div>
                          <div className="flex justify-between align-center" style={{ marginTop: '0.15rem' }}>
                            <button onClick={() => handleSpeakText(item.corrected)} style={{ padding: '2px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                               <Volume2 size={12} />
                            </button>
                            <button onClick={() => handleStartEditing(item)} style={{ padding: '2px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px' }}>
                              <Edit2 size={10} /> Correct
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Unified Display Board (Accessibility Display) */}
        <section className="card flex flex-col justify-between" style={{ border: '2px solid var(--color-accent)', padding: '1.5rem', minHeight: '180px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 'var(--font-xs)', color: 'var(--color-accent)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.35rem', marginBottom: '0.75rem', fontWeight: 800 }}>
              ACCESSIBILITY DISPLAY BOARD
            </h3>
            
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              {latestCorrected || interimRawText ? (
                <div>
                  <h1 style={{
                    fontSize: '2.5rem',
                    lineHeight: '1.3',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text)',
                    fontWeight: '800',
                    margin: 0
                  }}>
                    {interimRawText ? (
                      <span style={{ color: 'var(--color-text-muted)', opacity: 0.8 }}>{interimRawText}</span>
                    ) : (
                      latestCorrected
                    )}
                  </h1>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-accent)', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>
                    {interimRawText ? 'Capturing Speech Live...' : 'Active Speech Corrected'}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Awaiting translation output. Press "Start Listening" to begin.
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSpeakLastOutput}
            disabled={!latestCorrected}
            className="btn btn-accent"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
          >
            <Volume2 size={18} /> Speak Out Loud (TTS)
          </button>
        </section>

        {/* Collapsible Developer Debug Panel for Desktop */}
        <details className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-secondary)' }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer', outline: 'none', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={14} /> Show Developer Debug Panel
          </summary>
          <div style={{
            marginTop: '0.75rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-xs)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <span>Web Speech API Support:</span>
                <strong style={{ color: browserSupport ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {browserSupport ? 'Supported' : 'Not Supported'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginTop: '4px' }}>
                <span>Microphone Permission:</span>
                <strong style={{ color: micPermission === 'granted' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {micPermission.toUpperCase()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginTop: '4px' }}>
                <span>Is listening:</span>
                <strong>{isListening ? 'Yes' : 'No'}</strong>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <span>Recognition status:</span>
                <strong>{status.toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginTop: '4px' }}>
                <span>Current transcript:</span>
                <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }} title={transcript}>"{transcript || 'None'}"</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginTop: '4px', color: 'var(--color-danger)' }}>
                <span>Last Error:</span>
                <strong>{lastError || 'None'}</strong>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '4px' }}>
              <span>Last speech event:</span>
              <pre style={{ fontSize: '9px', margin: 0, overflowX: 'auto', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                {lastSpeechEvent ? JSON.stringify(lastSpeechEvent, null, 2) : 'None'}
              </pre>
            </div>
            {lastReceivedTranscript && (
              <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <strong>Last Received Speech:</strong>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2px' }}>
                  <div style={{ flex: 1 }}>Raw: <code style={{ color: 'var(--color-primary)' }}>"{lastReceivedTranscript.raw}"</code></div>
                  <div style={{ flex: 1 }}>Corrected: <code style={{ color: 'var(--color-accent)' }}>"{lastReceivedTranscript.corrected}"</code></div>
                </div>
              </div>
            )}
            {diagnosticResult && (
              <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontStyle: 'italic', wordBreak: 'break-all' }}>
                {diagnosticResult}
              </div>
            )}
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <button 
                onClick={handleRunDiagnostic} 
                className="btn btn-secondary" 
                style={{ fontSize: '10px', padding: '4px 8px', width: '100%', cursor: 'pointer' }}
              >
                Run Diagnostic
              </button>
            </div>
          </div>
        </details>

        {/* Control Buttons Bar */}
        <section className="card flex justify-between align-center" style={{ padding: '1rem 1.5rem' }}>
          <div className="flex gap-2">
            {status === 'listening' ? (
              <>
                <button onClick={handlePauseListening} className="btn btn-secondary">
                  <Pause size={18} /> Pause
                </button>
                <button onClick={handleStopListening} className="btn btn-danger">
                  <Square size={18} /> Stop
                </button>
              </>
            ) : (
              <button onClick={handleStartListening} className="btn btn-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                <Mic size={18} /> Start Listening
              </button>
            )}
            
            <button 
              onClick={handleClearTranscript} 
              disabled={transcriptSession.length === 0 && !interimRawText && !transcript}
              className="btn btn-secondary" 
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            >
              <Trash2 size={18} /> Clear Transcript
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCopy} disabled={transcriptSession.length === 0} className="btn btn-secondary">
              {copied ? <Check size={16} style={{ color: 'var(--color-accent)' }} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy All'}
            </button>
            <button onClick={() => { console.log('Saving session'); handleSaveSession(); }} disabled={transcriptSession.length === 0 || saved} className="btn btn-accent">
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? 'Saved' : 'Save Session'}
            </button>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: SESSION HISTORY & SPEECH INSIGHTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
        
        {/* Insights Panel */}
        <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Activity size={16} /> Speech Pattern Insights
          </h3>
          
          <div className="grid grid-2 gap-2" style={{ marginTop: '0.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Avg Match</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>{insights.averageConfidence}%</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Improvement</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{insights.improvementScore}%</span>
            </div>
          </div>

          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <span>Success Rate:</span>
            <strong style={{ color: 'var(--color-text)' }}>{insights.successRate}%</strong>
          </div>

          {insights.commonCorrections.length > 0 && (
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Common Pattern Corrections:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {insights.commonCorrections.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                    <strong>"{item.phrase}"</strong>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.count} times</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Session History Log List */}
        <div className="card flex flex-col" style={{ flex: 1, overflow: 'hidden', padding: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="flex align-center gap-2"><History size={16} /> Saved Session History</span>
            {history.length > 0 && (
              <button 
                onClick={() => { console.log('Clearing history'); clearHistory(); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Clear All
              </button>
            )}
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.length === 0 ? (
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                No session logs saved.
              </span>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-xs)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{item.corrected}"
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '9px', marginTop: '2px' }}>
                      Raw: "{item.original}" &bull; {item.confidence}% match
                    </div>
                  </div>
                  <button 
                    onClick={() => { console.log('Deleting record', item.id); deleteTranscription(item.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    title="Delete record"
                  >
                    <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};
