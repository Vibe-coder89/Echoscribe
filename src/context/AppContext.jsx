import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateInsights } from '../services/speechEngine';

const AppContext = createContext();

const DEFAULT_SETTINGS = {
  largeText: false,
  highContrast: false,
  dyslexiaFont: false,
  reducedMotion: false,
  keyboardNavigation: true
};

const DEFAULT_TRAINING = {
  samplesCollected: 0,
  confidenceEstimate: 60,
  readinessScore: 40,
  completedPhrases: [] // list of phrase strings completed
};

const DEFAULT_REHAB = {
  exercisesCompleted: 0,
  clarityScore: 65,
  consistency: 70,
  streak: 0,
  lastPractice: null,
  history: [] // { date, score, exerciseName }
};

export const AppProvider = ({ children }) => {
  // --- STATE DECLARATIONS ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('PWA Install Prompt outcome:', outcome);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('echoscribe_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [customDictionary, setCustomDictionary] = useState(() => {
    const saved = localStorage.getItem('echoscribe_dictionary');
    return saved ? JSON.parse(saved) : {};
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('echoscribe_favorites');
    return saved ? JSON.parse(saved) : [
      "I need support", 
      "Open YouTube", 
      "Call Mom", 
      "Please help me"
    ];
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    const saved = localStorage.getItem('echoscribe_accessibility');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [trainingProgress, setTrainingProgress] = useState(() => {
    const saved = localStorage.getItem('echoscribe_training');
    return saved ? JSON.parse(saved) : DEFAULT_TRAINING;
  });

  const [rehabStats, setRehabStats] = useState(() => {
    const saved = localStorage.getItem('echoscribe_rehab');
    return saved ? JSON.parse(saved) : DEFAULT_REHAB;
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('echoscribe_achievements');
    return saved ? JSON.parse(saved) : [
      { id: 'first_training', title: 'First Training Complete', desc: 'Recorded your first custom speech translation.', unlocked: false },
      { id: 'accuracy_90', title: '90% Accuracy Achieved', desc: 'Achieved high clarity on a speech transcription.', unlocked: false },
      { id: 'rehab_streak', title: 'One Week Streak', desc: 'Practiced rehabilitation exercises for 7 consecutive days.', unlocked: false },
      { id: 'custom_dict', title: 'Personalized Vocabulary', desc: 'Added your first word to the custom dictionary.', unlocked: false }
    ];
  });

  const [demoLoaded, setDemoLoaded] = useState(false);

  // --- PERSISTENCE SYNCS ---
  useEffect(() => {
    localStorage.setItem('echoscribe_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('echoscribe_dictionary', JSON.stringify(customDictionary));
  }, [customDictionary]);

  useEffect(() => {
    localStorage.setItem('echoscribe_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('echoscribe_accessibility', JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  useEffect(() => {
    localStorage.setItem('echoscribe_training', JSON.stringify(trainingProgress));
  }, [trainingProgress]);

  useEffect(() => {
    localStorage.setItem('echoscribe_rehab', JSON.stringify(rehabStats));
  }, [rehabStats]);

  useEffect(() => {
    localStorage.setItem('echoscribe_achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Apply accessibility settings directly to body elements
  useEffect(() => {
    const root = document.documentElement;
    
    if (accessibilitySettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibilitySettings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [accessibilitySettings]);

  // --- ACTIONS ---

  const addTranscription = (original, corrected, confidence, method) => {
    const newItem = {
      id: 'tx_' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      original,
      corrected,
      confidence,
      method,
      saved: true
    };
    setHistory(prev => [newItem, ...prev]);

    // Check achievement unlock
    if (confidence >= 90) {
      unlockAchievement('accuracy_90');
    }
  };

  const deleteTranscription = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const addCustomWord = (phrase, correction) => {
    setCustomDictionary(prev => ({
      ...prev,
      [phrase.trim().toLowerCase()]: correction.trim()
    }));
    unlockAchievement('custom_dict');
  };

  const deleteCustomWord = (phrase) => {
    setCustomDictionary(prev => {
      const updated = { ...prev };
      delete updated[phrase.trim().toLowerCase()];
      return updated;
    });
  };

  const toggleFavoritePhrase = (phrase) => {
    setFavorites(prev => {
      if (prev.includes(phrase)) {
        return prev.filter(p => p !== phrase);
      } else {
        return [...prev, phrase];
      }
    });
  };

  const updateAccessibilitySetting = (setting, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const recordTrainingSample = (phrase, textInput) => {
    setTrainingProgress(prev => {
      const isNew = !prev.completedPhrases.includes(phrase);
      const updatedPhrases = isNew ? [...prev.completedPhrases, phrase] : prev.completedPhrases;
      const count = updatedPhrases.length;
      
      // Calculate new accuracy / readiness metrics based on number of trained items
      const confidenceEst = Math.min(95, 60 + count * 3);
      const readiness = Math.min(100, Math.round((count / 12) * 100)); // Target 12 phrases to reach 100% readiness
      
      return {
        samplesCollected: prev.samplesCollected + 1,
        confidenceEstimate: confidenceEst,
        readinessScore: readiness,
        completedPhrases: updatedPhrases
      };
    });

    unlockAchievement('first_training');
  };

  const completeDailyExercise = (exerciseName, score) => {
    setRehabStats(prev => {
      const today = new Date().toDateString();
      const lastPracticeDay = prev.lastPractice ? new Date(prev.lastPractice).toDateString() : null;
      
      let newStreak = prev.streak;
      if (lastPracticeDay === null) {
        newStreak = 1;
      } else if (today !== lastPracticeDay) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (yesterday.toDateString() === lastPracticeDay) {
          newStreak += 1;
        } else {
          newStreak = 1; // streak broken
        }
      }

      if (newStreak >= 7) {
        unlockAchievement('rehab_streak');
      }

      // Clarify score recalculation
      const totalExercises = prev.exercisesCompleted + 1;
      const newClarity = Math.round((prev.clarityScore * prev.exercisesCompleted + score) / totalExercises);
      const newConsistency = Math.round(Math.min(98, prev.consistency + 1.2));

      return {
        exercisesCompleted: totalExercises,
        clarityScore: Math.min(100, Math.max(50, newClarity)),
        consistency: newConsistency,
        streak: newStreak,
        lastPractice: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), score, exerciseName }, ...prev.history].slice(0, 15)
      };
    });
  };

  const unlockAchievement = (id) => {
    setAchievements(prev => 
      prev.map(ach => ach.id === id ? { ...ach, unlocked: true } : ach)
    );
  };

  const resetAllData = () => {
    localStorage.removeItem('echoscribe_history');
    localStorage.removeItem('echoscribe_dictionary');
    localStorage.removeItem('echoscribe_favorites');
    localStorage.removeItem('echoscribe_accessibility');
    localStorage.removeItem('echoscribe_training');
    localStorage.removeItem('echoscribe_rehab');
    localStorage.removeItem('echoscribe_achievements');

    setHistory([]);
    setCustomDictionary({});
    setFavorites(["I need support", "Open YouTube", "Call Mom", "Please help me"]);
    setAccessibilitySettings(DEFAULT_SETTINGS);
    setTrainingProgress(DEFAULT_TRAINING);
    setRehabStats(DEFAULT_REHAB);
    setAchievements(prev => prev.map(ach => ({ ...ach, unlocked: false })));
    setDemoLoaded(false);
  };

  // --- DEMO DATA SEEDER ---
  const loadDemoData = () => {
    // 1. History
    const demoHistory = [
      { id: 'tx_demo1', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), original: 'hlp me', corrected: 'Help me', confidence: 95, method: 'exact', saved: true },
      { id: 'tx_demo2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), original: 'opl yutub', corrected: 'Open YouTube', confidence: 92, method: 'exact', saved: true },
      { id: 'tx_demo3', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), original: 'ggl map', corrected: 'Google Maps', confidence: 85, method: 'fuzzy', saved: true },
      { id: 'tx_demo4', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), original: 'nd wtr', corrected: 'Need water', confidence: 90, method: 'phonetic', saved: true },
      { id: 'tx_demo5', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), original: 'opn gmail', corrected: 'Open Gmail', confidence: 96, method: 'exact', saved: true },
      { id: 'tx_demo6', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), original: 'slp now', corrected: 'I want to sleep', confidence: 75, method: 'fuzzy', saved: true },
      { id: 'tx_demo7', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), original: 'cl mom', corrected: 'Call Mom', confidence: 98, method: 'exact', saved: true }
    ];
    setHistory(demoHistory);

    // 2. Custom Dictionary
    const demoDict = {
      "ggl": "Google",
      "wtr": "Water",
      "fam": "Family",
      "dr": "Doctor"
    };
    setCustomDictionary(demoDict);

    // 3. Training Progress
    setTrainingProgress({
      samplesCollected: 24,
      confidenceEstimate: 92,
      readinessScore: 85,
      completedPhrases: ["hlp me", "opl yutub", "cl mom", "opn gmail", "nd wtr", "ggl", "yt musc", "tly v"]
    });

    // 4. Rehab Stats
    setRehabStats({
      exercisesCompleted: 14,
      clarityScore: 84,
      consistency: 89,
      streak: 5,
      lastPractice: new Date().toISOString(),
      history: [
        { date: new Date(Date.now() - 12 * 3600000).toISOString(), score: 88, exerciseName: 'Daily Sentence Reading' },
        { date: new Date(Date.now() - 36 * 3600000).toISOString(), score: 82, exerciseName: 'Consonant Clarity drill' },
        { date: new Date(Date.now() - 60 * 3600000).toISOString(), score: 85, exerciseName: 'Vowel Projection practice' },
        { date: new Date(Date.now() - 84 * 3600000).toISOString(), score: 80, exerciseName: 'Daily Sentence Reading' },
        { date: new Date(Date.now() - 108 * 3600000).toISOString(), score: 79, exerciseName: 'Breath Pacing session' }
      ]
    });

    // 5. Unlock all achievements
    setAchievements(prev => prev.map(ach => ({ ...ach, unlocked: true })));
    setDemoLoaded(true);
  };

  const value = {
    history,
    customDictionary,
    favorites,
    accessibilitySettings,
    trainingProgress,
    rehabStats,
    achievements,
    demoLoaded,
    isInstallable,
    triggerInstall,
    addTranscription,
    deleteTranscription,
    clearHistory,
    addCustomWord,
    deleteCustomWord,
    toggleFavoritePhrase,
    updateAccessibilitySetting,
    recordTrainingSample,
    completeDailyExercise,
    loadDemoData,
    resetAllData,
    unlockAchievement
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
