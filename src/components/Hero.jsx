import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

function EnquiryForm({ className = '', onSuccess }) {
  const { config, submitEnquiry } = useSiteConfig();
  const [form, setForm] = useState({ name: '', phone: '', occasion: '', eventDate: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await submitEnquiry(form);
      setStatus('success');
      setForm({ name: '', phone: '', occasion: '', eventDate: '', message: '' });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className={`enquiry-form ${className}`}>
        <div className="form-success">
          <p>✨ Thank you! We'll get back to you within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <form className={`enquiry-form ${className}`} onSubmit={handleSubmit}>
      <h3>Let's Create Something Amazing!</h3>
      {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
      <div className="form-group">
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
      </div>
      <div className="form-group">
        <label>Occasion</label>
        <select required value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
          <option value="">Select occasion</option>
          {config.occasions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Event Date</label>
        <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Message</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your dream cake..." />
      </div>
      <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Request Quote'}
      </button>
    </form>
  );
}

export default function Hero({ onEnquire }) {
  const { config } = useSiteConfig();

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <img src={config.hero.imageUrl} alt="Hero cake" />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <h1>{config.hero.headline}</h1>
          <p>{config.hero.subheadline}</p>
          <div className="hero-buttons">
            <button className="btn btn-gold" onClick={onEnquire}>{config.hero.primaryCta}</button>
            <a href="#gallery" className="btn btn-outline">{config.hero.secondaryCta}</a>
          </div>
        </div>
        <EnquiryForm className="enquiry-form-desktop" />
      </div>
    </section>
  );
}

export { EnquiryForm };
