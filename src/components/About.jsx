import { useSiteConfig } from '../context/SiteConfigContext';

export default function About() {
  const { config } = useSiteConfig();

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img src={config.about.imageUrl} alt="About us" />
          </div>
          <div className="about-text">
            <h3>{config.about.title}</h3>
            <p>{config.about.description}</p>
            <div className="about-stats">
              {config.about.stats.map((stat, i) => (
                <div key={i} className="stat">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
