/**
 * EchoScribe AI Speech Engine Simulator
 * Handles fuzzy matching, phonetic similarity mapping, confidence scoring,
 * training simulation, and analytics generation.
 */

// Default speech mapping dictionary
export const DEFAULT_DICTIONARY = {
  "hlp me": "Help me",
  "cl mom": "Call Mom",
  "opn gmail": "Open Gmail",
  "yt musc": "YouTube Music",
  "opl yutub": "Open YouTube",
  "hlo": "Hello",
  "thnk u": "Thank you",
  "nd wtr": "Need water",
  "go out": "Go outside",
  "tly v": "Turn on TV",
  "lghts": "Turn on lights",
  "ggl": "Google",
  "plz hlp": "Please help",
  "col dad": "Call Dad",
  "meds": "Take medicine",
  "hungry": "I am hungry",
  "slp": "I want to sleep",
  "bath": "Need to use restroom",
  "thnk": "Thank you",
  "yes": "Yes",
  "no": "No"
};

// Calculate Levenshtein Distance between two strings
export function calculateLevenshtein(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Strip vowels for phonetic-like consonant comparison
function stripVowels(str) {
  return str.toLowerCase().replace(/[aeiou\s]/g, '');
}

/**
 * Cleans stuttering from raw input (e.g. "H-h-h-hello" -> "Hello", "w-w-water" -> "water")
 * @param {string} input - The raw input text
 * @returns {string} Cleaned text
 */
export function cleanStutter(input) {
  if (!input || typeof input !== 'string') return "";
  
  return input.split(/\s+/).map(word => {
    if (word.includes('-')) {
      const parts = word.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length > 0) {
        const isStutter = parts.slice(0, -1).every(part => {
          const cleanPart = part.toLowerCase();
          return cleanPart.length > 0 && (
            lastPart.toLowerCase().startsWith(cleanPart) || 
            (cleanPart.length === 1 && lastPart.toLowerCase().startsWith(cleanPart[0]))
          );
        });
        if (isStutter) {
          const firstCharIsUpper = word[0] === word[0].toUpperCase() && /[a-zA-Z]/.test(word[0]);
          if (firstCharIsUpper) {
            return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
          }
          return lastPart;
        }
      }
    }
    return word;
  }).join(' ');
}

/**
 * Predicts the corrected version of the input phrase
 * @param {string} input - The raw non-standard speech text
 * @param {Object} customDictionary - User-defined mappings from LocalStorage
 * @returns {Object} { original, corrected, confidence, method }
 */
export function predictCorrection(input, customDictionary = {}) {
  if (!input || typeof input !== 'string') {
    return { original: '', corrected: '', confidence: 0, method: 'none' };
  }

  // 1. Clean stuttering first
  const stutterCleaned = cleanStutter(input);
  const cleanInput = stutterCleaned.trim().toLowerCase();
  const hadStutter = stutterCleaned.toLowerCase().trim() !== input.toLowerCase().trim();

  // Merge default and custom dictionary (custom takes precedence)
  const fullDictionary = { ...DEFAULT_DICTIONARY, ...customDictionary };

  // 2. Direct exact match on cleaned input
  if (fullDictionary[cleanInput]) {
    return {
      original: input,
      corrected: fullDictionary[cleanInput],
      confidence: 98,
      method: hadStutter ? 'stutter_filter' : 'exact'
    };
  }

  // 3. Phonetic/Consonant Match on cleaned input (e.g. "hlpm" matches "help me")
  const inputConsonants = stripVowels(cleanInput);
  for (const [key, value] of Object.entries(fullDictionary)) {
    const keyConsonants = stripVowels(key);
    if (inputConsonants === keyConsonants && inputConsonants.length > 1) {
      return {
        original: input,
        corrected: value,
        confidence: Math.round(90 - (calculateLevenshtein(cleanInput, key) * 2)),
        method: hadStutter ? 'stutter_filter' : 'phonetic'
      };
    }
  }

  // 4. Fuzzy Levenshtein Match on cleaned input
  let bestMatchKey = null;
  let minDistance = Infinity;

  for (const key of Object.keys(fullDictionary)) {
    const distance = calculateLevenshtein(cleanInput, key);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatchKey = key;
    }
  }

  // Calculate similarity ratio
  const maxLen = Math.max(cleanInput.length, bestMatchKey ? bestMatchKey.length : 1);
  const similarity = 1 - minDistance / maxLen;

  // We only accept fuzzy match if similarity is reasonably high (e.g. > 0.45)
  if (bestMatchKey && similarity > 0.45) {
    const confidence = Math.round(similarity * 100);
    return {
      original: input,
      corrected: fullDictionary[bestMatchKey],
      confidence: Math.max(30, Math.min(95, confidence)),
      method: hadStutter ? 'stutter_filter' : 'fuzzy'
    };
  }

  // 5. Default Fallback
  // If we detected a stutter and cleaned it, we return the cleaned text with high confidence!
  if (hadStutter) {
    const fallbackText = stutterCleaned.charAt(0).toUpperCase() + stutterCleaned.slice(1);
    return {
      original: input,
      corrected: fallbackText,
      confidence: 95,
      method: 'stutter_filter'
    };
  }

  // No stutter and no dictionary match
  const fallbackText = input.charAt(0).toUpperCase() + input.slice(1);
  return {
    original: input,
    corrected: fallbackText,
    confidence: 45,
    method: 'fallback'
  };
}

/**
 * Simulates model training on a new speech sample
 * @param {string} phrase - The input speech pattern (e.g., "ggl")
 * @param {string} correction - The intended word (e.g., "Google")
 * @returns {Promise<Object>} Resolves with training feedback
 */
export function trainModel(phrase, correction) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanPhrase = phrase.trim().toLowerCase();
      const cleanCorrection = correction.trim();
      
      // Calculate training quality
      const levDistance = calculateLevenshtein(cleanPhrase, cleanCorrection);
      const complexityScore = Math.min(100, Math.round((cleanPhrase.length / 3) * 30));
      
      resolve({
        success: true,
        phrase: cleanPhrase,
        correction: cleanCorrection,
        qualityScore: Math.round(100 - (levDistance * 10)),
        complexity: complexityScore,
        timestamp: new Date().toISOString()
      });
    }, 1000); // Simulate network/processing delay
  });
}

/**
 * Generates speech pattern insights from history
 * @param {Array} history - Session history array
 * @returns {Object} An statistics report
 */
export function generateInsights(history = []) {
  if (history.length === 0) {
    return {
      totalTranscriptions: 0,
      averageConfidence: 0,
      commonCorrections: [],
      successRate: 0,
      improvementScore: 50
    };
  }

  const total = history.length;
  const avgConf = Math.round(history.reduce((sum, h) => sum + (h.confidence || 0), 0) / total);
  
  // Find common corrections
  const frequencyMap = {};
  history.forEach(item => {
    if (item.corrected) {
      frequencyMap[item.corrected] = (frequencyMap[item.corrected] || 0) + 1;
    }
  });

  const commonCorrections = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([phrase, count]) => ({ phrase, count }));

  // Success rate: percentage of transcriptions with confidence >= 70% or accepted by user
  const successCount = history.filter(h => h.confidence >= 70 || h.saved).length;
  const successRate = Math.round((successCount / total) * 100);

  // Improvement Score: derived from training progress & confidence over time
  // If later items have higher confidence, improvement is higher
  const firstHalf = history.slice(0, Math.ceil(total / 2));
  const secondHalf = history.slice(Math.ceil(total / 2));
  
  let improvementScore = 65; // base
  if (firstHalf.length && secondHalf.length) {
    const avgFirst = firstHalf.reduce((sum, h) => sum + h.confidence, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, h) => sum + h.confidence, 0) / secondHalf.length;
    const diff = avgSecond - avgFirst;
    improvementScore = Math.max(50, Math.min(99, Math.round(65 + diff * 2)));
  }

  return {
    totalTranscriptions: total,
    averageConfidence: avgConf,
    commonCorrections,
    successRate,
    improvementScore
  };
}
