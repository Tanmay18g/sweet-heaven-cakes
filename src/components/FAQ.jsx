import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function FAQ() {
  const { config } = useSiteConfig();
  const [openId, setOpenId] = useState(null);

  return (
    <section id="faq" className="section" style={{ background: 'var(--white)' }}>
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {config.faqs.map((faq) => (
            <div key={faq.id} className={`faq-item ${openId === faq.id ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <span>+</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
