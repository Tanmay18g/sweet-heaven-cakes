import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function InfoSection() {
  const { config } = useSiteConfig();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonial = config.testimonials[activeTestimonial];

  return (
    <section id="testimonials" className="section info-section">
      <div className="container">
        <div className="info-grid">
          <div className="why-choose">
            <h3>Why Choose Us?</h3>
            <ul className="why-list">
              {config.whyChooseUs.map((item, i) => (
                <li key={i}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="testimonial-card">
            <h3>What Our Clients Say</h3>
            <div className="stars">{'★'.repeat(testimonial.rating)}</div>
            <p className="testimonial-quote">"{testimonial.quote}"</p>
            <div className="testimonial-author">
              <img src={testimonial.avatarUrl} alt={testimonial.name} />
              <div>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
            {config.testimonials.length > 1 && (
              <div className="testimonial-dots">
                {config.testimonials.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                    onClick={() => setActiveTestimonial(i)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="instagram-section">
            <h3>Follow Us On Instagram</h3>
            <div className="instagram-grid">
              {config.instagramFeed.slice(0, 6).map((url, i) => (
                <img key={i} src={url} alt={`Instagram ${i + 1}`} loading="lazy" />
              ))}
            </div>
            <a
              href={config.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
              </svg>
              Follow {config.social.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
