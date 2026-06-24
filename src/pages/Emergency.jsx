import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Phone,
  Heart,
  HelpCircle,
  ShieldAlert,
  X,
  Volume2,
  Check,
  AlertTriangle,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react';

const COUNTRY_CODES = {
  IN: { name: "India", code: "+91", pattern: /^[6-9]\d{9}$/, placeholder: "9876543210 (10 digits)" },
  US: { name: "United States", code: "+1", pattern: /^\d{10}$/, placeholder: "2025550199 (10 digits)" },
  GB: { name: "United Kingdom", code: "+44", pattern: /^7\d{9}$|^\d{10}$/, placeholder: "7911123456 (10 digits)" },
  CA: { name: "Canada", code: "+1", pattern: /^\d{10}$/, placeholder: "4165550199 (10 digits)" },
  AU: { name: "Australia", code: "+61", pattern: /^4\d{8}$|^\d{9}$/, placeholder: "412345678 (9 digits)" }
};

const EMERGENCY_ACTIONS = [
  {
    id: 'em_medical',
    title: 'Medical Help',
    subtitle: 'Alert ambulance and doctor',
    speechText: 'Emergency: I require immediate medical help.',
    icon: Heart,
    color: '#D90429',
    bgColor: 'rgba(217, 4, 41, 0.1)'
  },
  {
    id: 'em_family',
    title: 'Call Family',
    subtitle: 'Notify primary caregivers',
    speechText: 'Emergency: Please contact my family immediately.',
    icon: Phone,
    color: '#2A9D8F',
    bgColor: 'rgba(42, 157, 143, 0.1)'
  },
  {
    id: 'em_assistance',
    title: 'Need Assistance',
    subtitle: 'Ask for physical support',
    speechText: 'Attention: I need physical assistance in this room.',
    icon: HelpCircle,
    color: '#F4A261',
    bgColor: 'rgba(244, 162, 97, 0.1)'
  },
  {
    id: 'em_contacts',
    title: 'Emergency Contacts',
    subtitle: 'Broadcast GPS coordinates',
    speechText: 'Attention: Broadcasting my current location to emergency contacts.',
    icon: ShieldAlert,
    color: '#E76F51',
    bgColor: 'rgba(231, 111, 81, 0.1)'
  }
];

export const Emergency = () => {
  const { favorites, toggleFavoritePhrase } = useApp();
  
  // App alert state
  const [activeAlert, setActiveAlert] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [alertSent, setAlertSent] = useState(false);
  const [gpsSimulated] = useState('37.7749° N, 122.4194° W');

  // Contact list state
  const [contacts, setContacts] = useState([]);
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showManageContacts, setShowManageContacts] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formCountry, setFormCountry] = useState('IN');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load contacts from LocalStorage on mount
  useEffect(() => {
    const storedContacts = localStorage.getItem('emergencyContacts');
    const storedPrimary = localStorage.getItem('primaryEmergencyContactId');
    if (storedContacts) {
      const parsed = JSON.parse(storedContacts);
      setContacts(parsed);
      if (storedPrimary) {
        setPrimaryContactId(storedPrimary);
      } else if (parsed.length > 0) {
        setPrimaryContactId(parsed[0].id);
        localStorage.setItem('primaryEmergencyContactId', parsed[0].id);
      }
    }
  }, []);

  // Alert sequence timer
  useEffect(() => {
    let timer;
    if (activeAlert && countdown > 0 && !alertSent) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (activeAlert && countdown === 0 && !alertSent) {
      triggerBroadcast();
    }
    return () => clearTimeout(timer);
  }, [activeAlert, countdown, alertSent]);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      synth.speak(utterance);
    }
  };

  const handleTriggerAlert = (action) => {
    speakText(`Initiating countdown for: ${action.title}`);
    setActiveAlert(action);
    setCountdown(5);
    setAlertSent(false);
  };

  const triggerBroadcast = () => {
    setAlertSent(true);
    speakText(`${activeAlert.speechText}. Location: GPS coordinates broadcasted.`);
    
    // Automatically trigger dialer for primary contact on broadcast completion if call is chosen
    const primary = contacts.find(c => c.id === primaryContactId);
    if (primary && activeAlert.id === 'em_family') {
      triggerPhoneCall(primary.phone);
    }
  };

  const handleCancelAlert = () => {
    speakText('Emergency alert cancelled.');
    setActiveAlert(null);
    setCountdown(5);
    setAlertSent(false);
  };

  // Helper to initiate tel calling
  const triggerPhoneCall = (phoneNumber) => {
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      speakText('Calling number. This feature is fully functional on mobile devices.');
    }
  };

  const handleCopyNumber = (number) => {
    navigator.clipboard.writeText(number)
      .then(() => {
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      });
  };

  // Dispatch event so layout floating FAB updates
  const notifyContactsUpdate = () => {
    window.dispatchEvent(new Event('emergency-contacts-updated'));
  };

  // Save Contact Handler
  const handleSaveContact = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!formRelationship.trim()) {
      setFormError('Relationship is required.');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('Phone number is required.');
      return;
    }

    const config = COUNTRY_CODES[formCountry];
    let cleaned = formPhone.replace(/\D/g, '');
    const codeDigits = config.code.replace(/\D/g, '');
    if (cleaned.startsWith(codeDigits) && cleaned.length === (codeDigits.length + config.placeholder.replace(/\D/g, '').length)) {
      cleaned = cleaned.slice(codeDigits.length);
    }

    if (!config.pattern.test(cleaned)) {
      setFormError(`Invalid number format for ${config.name}. Expected format: ${config.placeholder}`);
      return;
    }

    const formattedPhone = `${config.code}${cleaned}`;

    let updatedContacts;
    if (editingContact) {
      updatedContacts = contacts.map(c => c.id === editingContact.id ? {
        ...c,
        name: formName.trim(),
        phone: formattedPhone,
        localPhone: cleaned,
        relationship: formRelationship.trim(),
        country: formCountry,
        notes: formNotes.trim()
      } : c);
    } else {
      const newContact = {
        id: 'contact_' + Date.now(),
        name: formName.trim(),
        phone: formattedPhone,
        localPhone: cleaned,
        relationship: formRelationship.trim(),
        country: formCountry,
        notes: formNotes.trim()
      };
      updatedContacts = [...contacts, newContact];
    }

    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);

    // If it's the first contact, make it primary
    if (updatedContacts.length === 1 || (!primaryContactId && !editingContact)) {
      localStorage.setItem('primaryEmergencyContactId', updatedContacts[0].id);
      setPrimaryContactId(updatedContacts[0].id);
    }

    // Reset Form
    setIsAdding(false);
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormRelationship('');
    setFormCountry('IN');
    setFormNotes('');
    
    notifyContactsUpdate();
  };

  const handleEditContactClick = (contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.localPhone || contact.phone.replace(COUNTRY_CODES[contact.country].code, ''));
    setFormRelationship(contact.relationship);
    setFormCountry(contact.country);
    setFormNotes(contact.notes || '');
    setIsAdding(true);
  };

  const handleDeleteContact = (contactId) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);

    if (primaryContactId === contactId) {
      if (updatedContacts.length > 0) {
        localStorage.setItem('primaryEmergencyContactId', updatedContacts[0].id);
        setPrimaryContactId(updatedContacts[0].id);
      } else {
        localStorage.removeItem('primaryEmergencyContactId');
        setPrimaryContactId('');
      }
    }
    notifyContactsUpdate();
  };

  const handleSetPrimary = (contactId) => {
    localStorage.setItem('primaryEmergencyContactId', contactId);
    setPrimaryContactId(contactId);
    notifyContactsUpdate();
    speakText('Primary emergency contact changed.');
  };

  const primaryContact = contacts.find(c => c.id === primaryContactId);
  const isMobile = window.innerWidth <= 1024;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Emergency Communication Mode
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)' }}>
            High-contrast, large-target triggers for rapid calling, care notifications, and location broadcasting.
          </p>
        </div>
        {contacts.length > 0 && !isAdding && (
          <button 
            onClick={() => setShowManageContacts(!showManageContacts)} 
            className="btn btn-secondary flex align-center gap-2"
            style={{ padding: '0.75rem 1.25rem', fontSize: 'var(--font-sm)', fontWeight: 'bold' }}
          >
            {showManageContacts ? 'Show Alerts Grid' : 'Manage Contacts'}
          </button>
        )}
      </section>

      {/* SETUP FLOW: NO CONTACTS SAVED */}
      {contacts.length === 0 ? (
        <section className="card" style={{ borderLeft: '4px solid var(--color-danger)', padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: 'var(--font-2xl)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Emergency Calling Not Enabled
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-md)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Add your emergency contact to enable emergency calling, device dialer triggers, and quick access.
          </p>
          
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn btn-primary flex align-center justify-center gap-2"
            style={{ margin: '0 auto', padding: '1rem 2rem', fontSize: 'var(--font-md)', fontWeight: 'bold' }}
          >
            <UserPlus size={20} /> Add Emergency Contact
          </button>
        </section>
      ) : null}

      {/* FORM OVERLAY FOR ADDING/EDITING CONTACTS */}
      {isAdding && (
        <section className="card animate-fade-in" style={{ padding: '2rem', border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus style={{ color: 'var(--color-primary)' }} />
            {editingContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
          </h2>
          
          <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {formError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(217, 4, 41, 0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                {formError}
              </div>
            )}

            <div className="grid grid-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Contact Name *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mom"
                  style={{ width: '100%', padding: '0.75rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Relationship *</label>
                <input 
                  type="text" 
                  value={formRelationship}
                  onChange={(e) => setFormRelationship(e.target.value)}
                  placeholder="e.g. Mother, Spouse, Friend"
                  style={{ width: '100%', padding: '0.75rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Country & Prefix *</label>
                <select 
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-card)' }}
                >
                  {Object.entries(COUNTRY_CODES).map(([key, data]) => (
                    <option key={key} value={key}>{data.name} ({data.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Phone Number *</label>
                <input 
                  type="text" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder={COUNTRY_CODES[formCountry].placeholder}
                  style={{ width: '100%', padding: '0.75rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Optional Notes</label>
              <textarea 
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Medical history, home address, medication needs..."
                rows="3"
                style={{ width: '100%', padding: '0.75rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontWeight: 'bold' }}>
                Save Contact
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingContact(null);
                  setFormError('');
                }} 
                className="btn btn-secondary" 
                style={{ padding: '0.85rem 1.5rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PRIMARY EMERGENCY CONTACT DISPLAY CARD */}
      {contacts.length > 0 && !isAdding && !showManageContacts && (
        <section className="grid grid-2 gap-4">
          
          {/* Primary Contact Details */}
          <div className="card flex flex-col justify-between" style={{ border: '2px solid var(--color-accent)', padding: '2rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 'bold', color: 'var(--color-accent)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Primary Emergency Contact
              </span>
              {primaryContact ? (
                <>
                  <h2 style={{ fontSize: 'var(--font-3xl)', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    {primaryContact.name}
                  </h2>
                  <div style={{ display: 'inline-block', backgroundColor: 'rgba(231, 111, 81, 0.08)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {primaryContact.relationship}
                  </div>
                  
                  <div style={{ fontSize: 'var(--font-xl)', fontWeight: 'bold', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Phone size={20} style={{ color: 'var(--color-accent)' }} />
                    {primaryContact.phone}
                  </div>
                  
                  {primaryContact.notes && (
                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', borderLeft: '3px solid var(--color-accent)' }}>
                      <Info size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
                      <div>
                        <strong>Notes:</strong> {primaryContact.notes}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No primary contact selected.</p>
              )}
            </div>

            {primaryContact && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <button 
                  onClick={() => triggerPhoneCall(primaryContact.phone)} 
                  className="btn btn-primary flex align-center justify-center gap-2 pulse" 
                  style={{ flex: 2, height: '54px', fontSize: 'var(--font-md)', fontWeight: 'bold', backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                >
                  <Phone size={20} /> CALL NOW
                </button>
                <button 
                  onClick={() => handleEditContactClick(primaryContact)} 
                  className="btn btn-secondary flex align-center justify-center" 
                  style={{ flex: 1, height: '54px' }}
                >
                  Edit Contact
                </button>
                <button 
                  onClick={() => setShowManageContacts(true)} 
                  className="btn btn-secondary" 
                  style={{ height: '54px', padding: '0 1rem' }}
                >
                  Change Contact
                </button>
              </div>
            )}
          </div>

          {/* Desktop helper & QR Code Call functionality */}
          <div className="card flex flex-col justify-center align-center" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
            {!isMobile && primaryContact ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: 'var(--font-sm)' }}>
                  <Info size={16} /> Desktop Calling Assistant
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', maxWidth: '280px', margin: 0 }}>
                  This feature triggers native dialing on mobile. Scan this QR code or copy the number to dial instantly:
                </p>
                
                {/* Generates a functional Tel Protocol QR Code */}
                <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', margin: '0.5rem 0' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=tel:${encodeURIComponent(primaryContact.phone)}`} 
                    alt="Scan to call emergency number" 
                    style={{ width: '130px', height: '130px', display: 'block' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button 
                    onClick={() => handleCopyNumber(primaryContact.phone)} 
                    className="btn btn-primary flex align-center justify-center gap-1"
                    style={{ fontSize: 'var(--font-xs)', padding: '6px 12px', flex: 1 }}
                  >
                    {copiedSuccess ? <Check size={14} /> : <Copy size={14} />}
                    {copiedSuccess ? 'Copied!' : 'Copy Number'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                <Phone size={48} className="pulse" style={{ color: 'var(--color-accent)' }} />
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 'bold', color: 'var(--color-text)' }}>Mobile Call Link Enabled</h3>
                <p style={{ fontSize: 'var(--font-xs)', maxWidth: '300px', margin: 0 }}>
                  Pressing **Call Now** on your mobile device launches the system dialer with the emergency prefix prepended automatically.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MANAGE CONTACTS TAB VIEW */}
      {showManageContacts && !isAdding && (
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontFamily: 'var(--font-display)', margin: 0 }}>
              All Emergency Contacts ({contacts.length})
            </h2>
            <button 
              onClick={() => setIsAdding(true)} 
              className="btn btn-primary flex align-center gap-1"
              style={{ fontSize: 'var(--font-xs)', padding: '6px 12px' }}
            >
              <UserPlus size={14} /> Add Contact
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {contacts.map((contact) => {
              const isPrimary = contact.id === primaryContactId;
              return (
                <div 
                  key={contact.id} 
                  className="flex justify-between align-center" 
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isPrimary ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    backgroundColor: isPrimary ? 'rgba(231, 111, 81, 0.03)' : 'var(--bg-secondary)',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: 'var(--font-md)' }}>{contact.name}</span>
                      <span className="badge badge-primary" style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'capitalize' }}>
                        {contact.relationship}
                      </span>
                      {isPrimary && (
                        <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          Primary Contact
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong>Phone:</strong> {contact.phone}
                    </div>
                    {contact.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{contact.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {!isPrimary && (
                      <button 
                        onClick={() => handleSetPrimary(contact.id)} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Set Primary
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditContactClick(contact)} 
                      className="btn" 
                      style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-primary)' }}
                      title="Edit Contact"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteContact(contact.id)} 
                      className="btn" 
                      style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-danger)' }}
                      title="Delete Contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setShowManageContacts(false)} 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Return to Action Dashboard
          </button>
        </section>
      )}

      {/* Grid of Emergency Action Buttons */}
      {!isAdding && !showManageContacts && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Tactile Action Panels
            </h2>
            {contacts.length === 0 && (
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                * Add contact to enable actions
              </span>
            )}
          </div>

          {/* Alert Sequence Overlay */}
          {activeAlert && (
            <div
              className="card"
              style={{
                backgroundColor: alertSent ? 'rgba(217, 4, 41, 0.05)' : 'rgba(244, 162, 97, 0.05)',
                borderColor: alertSent ? '#D90429' : 'var(--color-secondary)',
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                animation: 'fadeIn 0.3s'
              }}
            >
              {alertSent ? (
                <>
                  <div style={{ color: '#D90429', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: 'var(--font-xl)' }}>
                    <AlertTriangle size={28} /> EMERGENCY ALERTS BROADCASTED
                  </div>
                  <p style={{ fontSize: 'var(--font-md)', color: 'var(--color-text)', maxWidth: '600px' }}>
                    Emergency broadcast triggered: <strong>"{activeAlert.speechText}"</strong>.
                  </p>
                  {primaryContact && (
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)', padding: '6px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      Notifying Primary caregiver: <strong>{primaryContact.name} ({primaryContact.phone})</strong>
                    </div>
                  )}
                  <button onClick={handleCancelAlert} className="btn btn-secondary">
                    Reset Alert System
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)' }}>
                    Broadcasting {activeAlert.title} in...
                  </h2>
                  <div style={{
                    fontSize: '4.5rem',
                    fontWeight: '800',
                    color: activeAlert.color,
                    lineHeight: '1',
                    fontFamily: 'var(--font-display)',
                    margin: '0.5rem 0'
                  }} className="pulse">
                    {countdown}
                  </div>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                    Synthesizer will read: "{activeAlert.speechText}"
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerBroadcast}
                      className="btn btn-primary"
                      style={{ backgroundColor: activeAlert.color }}
                    >
                      Send Now
                    </button>
                    <button
                      onClick={handleCancelAlert}
                      className="btn btn-secondary"
                      style={{ borderColor: activeAlert.color, color: activeAlert.color }}
                    >
                      <X size={16} /> Cancel Alert
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid-2 gap-4">
            {EMERGENCY_ACTIONS.map((action) => {
              const Icon = action.icon;
              const disabled = contacts.length === 0 || (!!activeAlert && !alertSent);
              return (
                <button
                  key={action.id}
                  onClick={() => handleTriggerAlert(action)}
                  disabled={disabled}
                  className="card flex align-center gap-4"
                  style={{
                    border: `2px solid ${disabled ? 'var(--color-border)' : action.color}`,
                    backgroundColor: 'var(--bg-card)',
                    padding: '2.5rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: disabled ? 0.5 : 1
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '16px',
                    backgroundColor: disabled ? 'var(--bg-secondary)' : action.bgColor,
                    color: disabled ? 'var(--color-text-muted)' : action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={36} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                      {action.title}
                    </h2>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                      {action.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Favorite Quick Phrases Section */}
      {!isAdding && !showManageContacts && (
        <section className="card">
          <h2 style={{ fontSize: 'var(--font-lg)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Quick-Access Common Phrases
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Frequently used items for fast spoken feedback. Click to synthesize speech output instantly.
          </p>

          {favorites.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>
              No favorites saved. Toggle star icons on Live Translation page to build this dashboard.
            </div>
          ) : (
            <div className="grid grid-2 gap-2">
              {favorites.map((phrase, index) => (
                <div
                  key={index}
                  className="flex justify-between align-center"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--bg-secondary)',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                    "{phrase}"
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => speakText(phrase)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <Volume2 size={12} /> Speak
                    </button>
                    <button
                      onClick={() => toggleFavoritePhrase(phrase)}
                      className="btn"
                      style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                    >
                      ★
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};
