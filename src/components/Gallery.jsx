import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Gallery() {
  const { config } = useSiteConfig();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const filtered = activeFilter === 'All'
    ? config.gallery
    : config.gallery.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase());

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <section id="gallery" className="section">
      <div className="container">
        <h2 className="section-title">Our Cake Gallery</h2>
        <div className="gallery-filters">
          {config.galleryFilters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => { setActiveFilter(filter); setShowAll(false); }}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {displayed.map((item) => (
            <div key={item.id} className="gallery-item">
              <img src={item.imageUrl} alt={item.alt || 'Cake'} loading="lazy" />
            </div>
          ))}
        </div>
        {filtered.length > 10 && !showAll && (
          <div className="gallery-more">
            <button className="btn btn-outline" onClick={() => setShowAll(true)}>View More Cakes</button>
          </div>
        )}
      </div>
    </section>
  );
}
