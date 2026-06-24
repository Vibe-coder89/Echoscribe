import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle,
  HelpCircle,
  Users,
  Compass
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { loadDemoData } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);

  const handleTryDemo = () => {
    loadDemoData();
    navigate('/transcription');
  };

  const faqData = [
    {
      q: "How does EchoScribe learn my speech pattern?",
      a: "EchoScribe utilizes dynamic pattern alignment. By recording 5 to 10 short voice samples or typing common shorthand, the local simulator builds a translation matrix matching your specific phonetics to complete words and sentences."
    },
    {
      q: "Does my audio data leave my device?",
      a: "No. EchoScribe is built on privacy-first local translation. The system runs offline, ensuring your voice samples and transcripts are saved entirely on your device's local storage."
    },
    {
      q: "Who is EchoScribe designed for?",
      a: "It is designed for individuals with non-standard speech patterns, including those recovering from strokes, living with dysarthria, stutters, apraxia of speech, or very strong regional accent variations that typical voice recognizers misinterpret."
    },
    {
      q: "Can I customize the translations?",
      a: "Yes! You can use the Personal Dictionary feature to map any custom speech slang or non-standard vocalizations directly to the correct output (e.g. training 'ggl' to resolve to 'Google')."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 1. HERO SECTION */}
      <section className="flex flex-col align-center text-center gap-3" style={{ padding: '3rem 0 1.5rem 0' }}>
        <span className="badge badge-primary" style={{ padding: '6px 16px', fontSize: 'var(--font-sm)', fontWeight: 'bold' }}>
          EchoScribe MVP Launch
        </span>
        <h1 style={{ fontSize: 'var(--font-5xl)', fontWeight: 800, color: 'var(--color-text)', maxWidth: '800px', margin: '0.5rem 0' }}>
          Helping Every Voice <br />
          <span style={{ color: 'var(--color-primary)' }}>Be Understood</span>
        </h1>
        <p style={{ fontSize: 'var(--font-lg)', color: 'var(--color-text-muted)', maxWidth: '600px', lineHeight: '1.6', margin: '0 auto' }}>
          EchoScribe learns your unique speech patterns, custom shorthand, and vocalizations, translating them in real-time into clear, accessible text.
        </p>

        {/* Beautiful CSS Graphic: Wave & Connection */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          margin: '2rem 0',
          padding: '2rem',
          backgroundColor: 'rgba(244, 162, 97, 0.05)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border)',
          width: '100%',
          maxWidth: '500px'
        }}>
          <div className="flex align-center gap-1">
            <span className="wave-bar" style={{ height: '30px' }} />
            <span className="wave-bar" style={{ height: '50px' }} />
            <span className="wave-bar" style={{ height: '70px' }} />
            <span className="wave-bar" style={{ height: '40px' }} />
            <span className="wave-bar" style={{ height: '20px' }} />
          </div>
          <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
            <ArrowRight size={24} className="pulse" />
          </div>
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)'
          }}>
            "Open YouTube"
          </div>
        </div>

        <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
          <Link to="/transcription" className="btn btn-primary">
            Try Live Mode <Sparkles size={18} />
          </Link>
          <Link to="/training" className="btn btn-secondary">
            Start Training <Mic size={18} />
          </Link>
        </div>
      </section>

      {/* 2. FEATURES */}
      <section>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'var(--font-3xl)', marginBottom: '0.75rem' }}>Designed For Connection</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            A comprehensive communication tool engineered specifically for individuals with speech diversity.
          </p>
        </div>

        <div className="grid grid-3 gap-3">
          <div className="card">
            <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><Mic size={28} /></div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Adaptive Training</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Train the simulator with custom recordings and target text. The AI adapts to your slurs, pacing, and breath pauses.
            </p>
          </div>
          <div className="card">
            <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}><Sparkles size={28} /></div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Fuzzy Translation</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Corrects phonetic shortcuts, slurred inputs, or abbreviations instantly with high-confidence predictive matching.
            </p>
          </div>
          <div className="card">
            <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}><HeartHandshake size={28} /></div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Rehab Therapy</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Practice speech clarity exercises to rebuild vocal muscle coordination and track confidence scores day by day.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'var(--font-3xl)', marginBottom: '0.5rem' }}>How EchoScribe Works</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Three steps to fluid, personalized speech output.</p>
        </div>

        <div className="grid grid-3 gap-4" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 'bold', fontSize: 'var(--font-lg)' }}>1</div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Record Speech Patterns</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Provide short recordings or examples of your standard speech patterns for target words.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 'bold', fontSize: 'var(--font-lg)' }}>2</div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Personalize Vocabulary</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Add custom shortcuts for family names, smart device commands, or medical alerts.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 'bold', fontSize: 'var(--font-lg)' }}>3</div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '0.5rem' }}>Communicate Freely</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Translate speech into clear text, read out loud with browser audio, or execute emergency alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHY IT MATTERS */}
      <section className="flex flex-col gap-3">
        <div className="grid grid-2 gap-4 align-center">
          <div>
            <h2 style={{ fontSize: 'var(--font-3xl)', marginBottom: '1.5rem' }}>
              Breaking Barriers, <br />One Word at a Time.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="flex gap-2 align-center">
                <div style={{ color: 'var(--color-accent)' }}><ShieldCheck size={24} /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Privacy first design</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>Offline rendering guarantees your personal conversations remain completely confidential.</p>
                </div>
              </div>
              <div className="flex gap-2 align-center">
                <div style={{ color: 'var(--color-accent)' }}><Users size={24} /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Built for Accessibility</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>Dyslexic typography, large action targets, and keyboard navigation support built natively.</p>
                </div>
              </div>
              <div className="flex gap-2 align-center">
                <div style={{ color: 'var(--color-accent)' }}><Compass size={24} /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Smart Rehab Tracking</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>Rebuild voice confidence with structured exercises, clarity scores, and performance feedback.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* visual badge stack */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>100%</span>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Offline Security</p>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'bold', color: 'var(--color-accent)' }}>12+</span>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Speech Exercises</p>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'bold', color: 'var(--color-secondary)' }}>95%</span>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Correction Accuracy</p>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'bold', color: 'var(--color-accent)' }}>4+</span>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Accessibility Modes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section>
        <h2 style={{ fontSize: 'var(--font-3xl)', textAlign: 'center', marginBottom: '2.5rem' }}>Loved by Users & Caregivers</h2>
        <div className="grid grid-2 gap-3">
          <div className="card" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--color-primary)' }}><MessageCircle size={28} /></div>
            <div>
              <p style={{ fontSize: 'var(--font-md)', italic: 'true', marginBottom: '1rem', lineHeight: '1.6' }}>
                "EchoScribe changed the way I interact with speech assistants. Because of my apraxia, typical apps fail, but the training mode adapted to my exact voice patterns."
              </p>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'bold' }}>David K.</h4>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Stroke Survivor</span>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--color-accent)' }}><MessageCircle size={28} /></div>
            <div>
              <p style={{ fontSize: 'var(--font-md)', italic: 'true', marginBottom: '1rem', lineHeight: '1.6' }}>
                "As a speech-language pathologist, I recommend EchoScribe to my patients for practice. The clarity scoring and practice streaks keep them extremely motivated."
              </p>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'bold' }}>Sarah L.</h4>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>SLP Pathologist</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQS */}
      <section>
        <h2 style={{ fontSize: 'var(--font-3xl)', textAlign: 'center', marginBottom: '2.5rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          {faqData.map((faq, idx) => (
            <div key={idx} className="card" style={{ padding: '1.25rem 2rem', cursor: 'pointer' }} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
              <div className="flex justify-between align-center" style={{ fontWeight: 'bold', fontSize: 'var(--font-md)' }}>
                <span className="flex align-center gap-2"><HelpCircle size={18} style={{ color: 'var(--color-primary)' }} /> {faq.q}</span>
                <span>{activeFaq === idx ? '−' : '+'}</span>
              </div>
              {activeFaq === idx && (
                <p style={{ marginTop: '1rem', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)'
      }}>
        <div>
          <h4 style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>EchoScribe Accessibility Platform</h4>
          <p>Supporting speech independence and accessible communication.</p>
        </div>
        <div>
          <p>© 2026 EchoScribe Inc. All Rights Reserved. Offline Prototype Mode.</p>
        </div>
      </footer>

    </div>
  );
};
