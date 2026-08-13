import { useRef } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function ExploreCakes() {
  const { config } = useSiteConfig();
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Explore Our Cakes</h2>
        <div className="categories-slider">
          <button className="slider-btn prev" onClick={() => scroll(-1)} aria-label="Previous">‹</button>
          <div className="categories-track" ref={trackRef}>
            {config.categories.map((cat) => (
              <a key={cat.id} href={`#gallery`} className="category-card">
                <img src={cat.imageUrl} alt={cat.label} />
                <span>{cat.label}</span>
              </a>
            ))}
          </div>
          <button className="slider-btn next" onClick={() => scroll(1)} aria-label="Next">›</button>
        </div>
      </div>
    </section>
  );
}
