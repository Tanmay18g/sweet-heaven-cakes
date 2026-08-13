import { useSiteConfig } from '../context/SiteConfigContext';

export default function BuildCustomCake({ onEnquire }) {
  const { config } = useSiteConfig();

  return (
    <section id="process" className="section" style={{ background: 'var(--white)' }}>
      <div className="container">
        <h2 className="section-title">Build Your Custom Cake</h2>
        <div className="process-steps">
          {config.processSteps.map((step, i) => (
            <div key={step.step} style={{ display: 'contents' }}>
              <div className="process-step">
                <div className="step-circle">{step.icon}</div>
                <span>{step.title}</span>
              </div>
              {i < config.processSteps.length - 1 && <span className="step-arrow">→</span>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn btn-gold" onClick={onEnquire}>Get Your Quote</button>
        </div>
      </div>
    </section>
  );
}
