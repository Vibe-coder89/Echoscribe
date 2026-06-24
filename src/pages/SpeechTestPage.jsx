import React, { useEffect } from 'react';

export const SpeechTestPage = () => {
  useEffect(() => {
    console.log("--- STANDALONE SPEECH PAGE MOUNTED ---");
  }, []);

  const runTest = () => {
    const logContainer = document.getElementById("test-log-output");
    if (logContainer) logContainer.innerHTML = "";

    const addLog = (message, details = "") => {
      console.log(`[SpeechTest] ${message}`, details);
      const logLine = document.createElement("div");
      logLine.style.borderBottom = "1px solid #eee";
      logLine.style.padding = "4px 0";
      logLine.style.fontSize = "12px";
      logLine.innerHTML = `<strong>${new Date().toLocaleTimeString()} - ${message}</strong> ${details ? `<pre style="margin:2px 0 0 0; background:#f4f4f4; padding:4px;">${details}</pre>` : ""}`;
      if (logContainer) logContainer.appendChild(logLine);
    };

    addLog("Browser: " + navigator.userAgent);
    addLog("Online: " + navigator.onLine);
    addLog("Location: " + window.location.href);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("ERROR: SpeechRecognition API NOT supported in this browser.");
      return;
    }

    try {
      addLog("Instantiating new SpeechRecognition...");
      const testRec = new SpeechRecognition();
      testRec.continuous = true;
      testRec.interimResults = true;
      testRec.lang = "en-US";
      testRec.maxAlternatives = 1;

      testRec.onstart = () => {
        addLog("EVENT: onstart fired successfully.");
      };

      testRec.onresult = (event) => {
        const transcriptText = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("");
        addLog("EVENT: onresult fired.", `Transcript: "${transcriptText}"\nResults length: ${event.results.length}`);
      };

      testRec.onerror = (event) => {
        addLog(`EVENT: onerror fired.`, `Error code: "${event.error}"\nMessage: "${event.message}"`);
      };

      testRec.onend = () => {
        addLog("EVENT: onend fired.");
      };

      addLog("Calling testRec.start()...");
      testRec.start();
    } catch (e) {
      addLog("EXCEPTION thrown during setup/start:", e.toString());
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem' }}>Isolated SpeechRecognition Test</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        This page runs a standard SpeechRecognition instance without React state, custom processors, or permission checking.
      </p>
      
      <button 
        onClick={runTest} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '1rem'
        }}
      >
        Start Isolated Test
      </button>

      <div style={{ marginTop: '1rem' }}>
        <h3>Test Outputs</h3>
        <div 
          id="test-log-output" 
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            backgroundColor: '#fafafa',
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace'
          }}
        >
          <em>Logs will appear here when you click "Start Isolated Test"...</em>
        </div>
      </div>
    </div>
  );
};
