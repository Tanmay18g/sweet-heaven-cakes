import { useState, useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

const SECTIONS = [
  { id: 'brand', label: 'Brand & Hero' },
  { id: 'contact', label: 'Contact & Social' },
  { id: 'categories', label: 'Categories' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'about', label: 'About & Stats' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'content', label: 'Content Blocks' },
  { id: 'enquiries', label: 'Enquiries' },
];

function Field({ label, children }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ImageField({ label, value, onChange, onUpload, adminPassword }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await onUpload(file, adminPassword);
      onChange(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Field label={label}>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      <input type="file" accept="image/*" onChange={handleFile} style={{ marginTop: 8 }} />
      {value && <img src={value} alt="Preview" className="admin-image-preview" />}
    </Field>
  );
}

export default function Admin() {
  const { config, authenticate, saveConfig, uploadImage, getEnquiries } = useSiteConfig();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState(config);
  const [section, setSection] = useState('brand');
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [loginError, setLoginError] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_auth');
    if (saved) {
      setPassword(saved);
      authenticate(saved)
        .then(() => setAuthenticated(true))
        .catch(() => sessionStorage.removeItem('admin_auth'));
    }
  }, [authenticate]);

  useEffect(() => {
    if (authenticated && section === 'enquiries') {
      getEnquiries(password).then(setEnquiries).catch(() => setEnquiries([]));
    }
  }, [authenticated, section, password, getEnquiries]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  const login = async (e) => {
    e.preventDefault();
    try {
      await authenticate(password);
    } catch {
      setLoginError('Invalid password. Please try again.');
      return;
    }
    setLoginError('');
    sessionStorage.setItem('admin_auth', password);
    setAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
    setPassword('');
  };

  const update = (path, value) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveConfig(draft, password);
      setMessage({ type: 'success', text: 'Changes saved! Your website will update within a few seconds.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateListItem = (listKey, index, field, value) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[listKey][index][field] = value;
      return next;
    });
  };

  const addListItem = (listKey, template) => {
    setDraft((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], template],
    }));
  };

  const removeListItem = (listKey, index) => {
    setDraft((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="admin-login-card">
            <h1>Super Admin</h1>
            <p>Manage all website content, images, and settings</p>
            <form onSubmit={login}>
              {loginError && (
                <div className="admin-message error" style={{ marginBottom: 16 }}>{loginError}</div>
              )}
              <Field label="Admin Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </Field>
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: 16 }}>
                Login
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: '0.75rem', color: '#999' }}>
              Default password is set during Azure deployment
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectSection = (id) => {
    setSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="admin-page">
      {mobileNavOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div className="admin-layout">
        <aside className={`admin-sidebar ${mobileNavOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-top">
            <h2>🎂 Admin</h2>
            <button
              type="button"
              className="admin-mobile-close"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <ul className="admin-nav">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  className={section === s.id ? 'active' : ''}
                  onClick={() => selectSection(s.id)}
                >
                  {s.label}
                </button>
              </li>
            ))}
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </ul>
        </aside>

        <main className="admin-main">
          <div className="admin-mobile-bar">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="admin-mobile-title">{SECTIONS.find((s) => s.id === section)?.label}</span>
            <a href="/" className="admin-mobile-site-link" target="_blank" rel="noopener noreferrer">View</a>
          </div>

          <div className="admin-header">
            <h1>{SECTIONS.find((s) => s.id === section)?.label}</h1>
            <div className="admin-header-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'site-config.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </button>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        setDraft(JSON.parse(reader.result));
                        setMessage({ type: 'success', text: 'Config imported. Click Save Changes to apply.' });
                      } catch {
                        setMessage({ type: 'error', text: 'Invalid JSON file' });
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
              <a href="/" className="btn btn-outline" target="_blank">View Site</a>
            </div>
          </div>

          {message && (
            <div className={`admin-message ${message.type}`}>{message.text}</div>
          )}

          {section === 'brand' && (
            <>
              <div className="admin-card">
                <h3>Brand Identity</h3>
                <div className="admin-row">
                  <Field label="Business Name">
                    <input value={draft.brand.name} onChange={(e) => update('brand.name', e.target.value)} />
                  </Field>
                  <Field label="Tagline">
                    <input value={draft.brand.tagline} onChange={(e) => update('brand.tagline', e.target.value)} />
                  </Field>
                </div>
              </div>
              <div className="admin-card">
                <h3>Hero Section</h3>
                <Field label="Headline">
                  <input value={draft.hero.headline} onChange={(e) => update('hero.headline', e.target.value)} />
                </Field>
                <Field label="Subheadline">
                  <textarea value={draft.hero.subheadline} onChange={(e) => update('hero.subheadline', e.target.value)} />
                </Field>
                <ImageField
                  label="Hero Background Image"
                  value={draft.hero.imageUrl}
                  onChange={(v) => update('hero.imageUrl', v)}
                  onUpload={uploadImage}
                  adminPassword={password}
                />
                <div className="admin-row">
                  <Field label="Primary CTA">
                    <input value={draft.hero.primaryCta} onChange={(e) => update('hero.primaryCta', e.target.value)} />
                  </Field>
                  <Field label="Secondary CTA">
                    <input value={draft.hero.secondaryCta} onChange={(e) => update('hero.secondaryCta', e.target.value)} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {section === 'contact' && (
            <div className="admin-card">
              <h3>Contact Information</h3>
              <div className="admin-row">
                <Field label="Phone Number">
                  <input value={draft.contact.phone} onChange={(e) => update('contact.phone', e.target.value)} />
                </Field>
                <Field label="Email">
                  <input value={draft.contact.email} onChange={(e) => update('contact.email', e.target.value)} />
                </Field>
              </div>
              <Field label="Address">
                <textarea value={draft.contact.address} onChange={(e) => update('contact.address', e.target.value)} />
              </Field>
              <Field label="Google Maps Embed URL">
                <input value={draft.contact.mapEmbedUrl} onChange={(e) => update('contact.mapEmbedUrl', e.target.value)} />
              </Field>
              <h3 style={{ marginTop: 24 }}>Social Links</h3>
              <Field label="Instagram Profile URL">
                <input value={draft.social.instagram} onChange={(e) => update('social.instagram', e.target.value)} />
              </Field>
              <Field label="Instagram Handle (display)">
                <input value={draft.social.instagramHandle} onChange={(e) => update('social.instagramHandle', e.target.value)} />
              </Field>
              <Field label="WhatsApp Business Link">
                <input value={draft.social.whatsapp} onChange={(e) => update('social.whatsapp', e.target.value)} placeholder="https://wa.me/918209046188" />
              </Field>
            </div>
          )}

          {section === 'categories' && (
            <div className="admin-card">
              <h3>Cake Categories</h3>
              {draft.categories.map((cat, i) => (
                <div key={i} className="admin-list-item">
                  <div style={{ flex: 1 }}>
                    <div className="admin-row">
                      <Field label="Label">
                        <input value={cat.label} onChange={(e) => updateListItem('categories', i, 'label', e.target.value)} />
                      </Field>
                      <Field label="ID">
                        <input value={cat.id} onChange={(e) => updateListItem('categories', i, 'id', e.target.value)} />
                      </Field>
                    </div>
                    <ImageField
                      label="Category Image"
                      value={cat.imageUrl}
                      onChange={(v) => updateListItem('categories', i, 'imageUrl', v)}
                      onUpload={uploadImage}
                      adminPassword={password}
                    />
                  </div>
                  <button className="btn admin-btn-sm admin-btn-danger" onClick={() => removeListItem('categories', i)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline" onClick={() => addListItem('categories', { id: 'new', label: 'New Category', imageUrl: '' })}>Add Category</button>
            </div>
          )}

          {section === 'gallery' && (
            <div className="admin-card">
              <h3>Gallery Images</h3>
              {draft.gallery.map((item, i) => (
                <div key={i} className="admin-list-item">
                  <div style={{ flex: 1 }}>
                    <div className="admin-row">
                      <Field label="Category">
                        <select value={item.category} onChange={(e) => updateListItem('gallery', i, 'category', e.target.value)}>
                          {['wedding', 'birthday', 'retirement', 'anniversary', 'corporate', 'kids'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Alt Text">
                        <input value={item.alt || ''} onChange={(e) => updateListItem('gallery', i, 'alt', e.target.value)} />
                      </Field>
                    </div>
                    <ImageField
                      label="Image"
                      value={item.imageUrl}
                      onChange={(v) => updateListItem('gallery', i, 'imageUrl', v)}
                      onUpload={uploadImage}
                      adminPassword={password}
                    />
                  </div>
                  <button className="btn admin-btn-sm admin-btn-danger" onClick={() => removeListItem('gallery', i)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline" onClick={() => addListItem('gallery', { id: String(Date.now()), category: 'wedding', imageUrl: '', alt: '' })}>Add Gallery Image</button>
            </div>
          )}

          {section === 'testimonials' && (
            <>
              <div className="admin-card">
                <h3>Testimonials</h3>
                {draft.testimonials.map((t, i) => (
                  <div key={i} className="admin-list-item">
                    <div style={{ flex: 1 }}>
                      <div className="admin-row">
                        <Field label="Name">
                          <input value={t.name} onChange={(e) => updateListItem('testimonials', i, 'name', e.target.value)} />
                        </Field>
                        <Field label="Role">
                          <input value={t.role} onChange={(e) => updateListItem('testimonials', i, 'role', e.target.value)} />
                        </Field>
                      </div>
                      <Field label="Quote">
                        <textarea value={t.quote} onChange={(e) => updateListItem('testimonials', i, 'quote', e.target.value)} />
                      </Field>
                      <Field label="Rating">
                        <input type="number" min="1" max="5" value={t.rating} onChange={(e) => updateListItem('testimonials', i, 'rating', Number(e.target.value))} />
                      </Field>
                      <ImageField
                        label="Avatar"
                        value={t.avatarUrl}
                        onChange={(v) => updateListItem('testimonials', i, 'avatarUrl', v)}
                        onUpload={uploadImage}
                        adminPassword={password}
                      />
                    </div>
                    <button className="btn admin-btn-sm admin-btn-danger" onClick={() => removeListItem('testimonials', i)}>Remove</button>
                  </div>
                ))}
                <button className="btn btn-outline" onClick={() => addListItem('testimonials', { id: String(Date.now()), name: '', role: '', rating: 5, quote: '', avatarUrl: '' })}>Add Testimonial</button>
              </div>
              <div className="admin-card">
                <h3>Instagram Feed Images</h3>
                {draft.instagramFeed.map((url, i) => (
                  <div key={i} className="admin-list-item">
                    <div style={{ flex: 1 }}>
                      <ImageField
                        label={`Image ${i + 1}`}
                        value={url}
                        onChange={(v) => {
                          setDraft((prev) => {
                            const next = { ...prev, instagramFeed: [...prev.instagramFeed] };
                            next.instagramFeed[i] = v;
                            return next;
                          });
                        }}
                        onUpload={uploadImage}
                        adminPassword={password}
                      />
                    </div>
                    <button className="btn admin-btn-sm admin-btn-danger" onClick={() => {
                      setDraft((prev) => ({ ...prev, instagramFeed: prev.instagramFeed.filter((_, idx) => idx !== i) }));
                    }}>Remove</button>
                  </div>
                ))}
                <button className="btn btn-outline" onClick={() => setDraft((prev) => ({ ...prev, instagramFeed: [...prev.instagramFeed, ''] }))}>Add Instagram Image</button>
              </div>
            </>
          )}

          {section === 'about' && (
            <div className="admin-card">
              <h3>About Section</h3>
              <Field label="Title">
                <input value={draft.about.title} onChange={(e) => update('about.title', e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea value={draft.about.description} onChange={(e) => update('about.description', e.target.value)} />
              </Field>
              <ImageField
                label="About Image"
                value={draft.about.imageUrl}
                onChange={(v) => update('about.imageUrl', v)}
                onUpload={uploadImage}
                adminPassword={password}
              />
              <h3 style={{ marginTop: 24 }}>Statistics</h3>
              {draft.about.stats.map((stat, i) => (
                <div key={i} className="admin-row">
                  <Field label="Value">
                    <input value={stat.value} onChange={(e) => {
                      setDraft((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        next.about.stats[i].value = e.target.value;
                        return next;
                      });
                    }} />
                  </Field>
                  <Field label="Label">
                    <input value={stat.label} onChange={(e) => {
                      setDraft((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        next.about.stats[i].label = e.target.value;
                        return next;
                      });
                    }} />
                  </Field>
                </div>
              ))}
            </div>
          )}

          {section === 'faqs' && (
            <div className="admin-card">
              <h3>FAQs</h3>
              {draft.faqs.map((faq, i) => (
                <div key={i} className="admin-list-item">
                  <div style={{ flex: 1 }}>
                    <Field label="Question">
                      <input value={faq.question} onChange={(e) => updateListItem('faqs', i, 'question', e.target.value)} />
                    </Field>
                    <Field label="Answer">
                      <textarea value={faq.answer} onChange={(e) => updateListItem('faqs', i, 'answer', e.target.value)} />
                    </Field>
                  </div>
                  <button className="btn admin-btn-sm admin-btn-danger" onClick={() => removeListItem('faqs', i)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline" onClick={() => addListItem('faqs', { id: String(Date.now()), question: '', answer: '' })}>Add FAQ</button>
            </div>
          )}

          {section === 'content' && (
            <>
              <div className="admin-card">
                <h3>Why Choose Us</h3>
                {draft.whyChooseUs.map((item, i) => (
                  <div key={i} className="admin-row">
                    <Field label="Icon">
                      <input value={item.icon} onChange={(e) => {
                        setDraft((prev) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          next.whyChooseUs[i].icon = e.target.value;
                          return next;
                        });
                      }} />
                    </Field>
                    <Field label="Text">
                      <input value={item.text} onChange={(e) => {
                        setDraft((prev) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          next.whyChooseUs[i].text = e.target.value;
                          return next;
                        });
                      }} />
                    </Field>
                  </div>
                ))}
              </div>
              <div className="admin-card">
                <h3>CTA Banner</h3>
                <Field label="Title">
                  <input value={draft.ctaBanner.title} onChange={(e) => update('ctaBanner.title', e.target.value)} />
                </Field>
                <Field label="Button Text">
                  <input value={draft.ctaBanner.buttonText} onChange={(e) => update('ctaBanner.buttonText', e.target.value)} />
                </Field>
              </div>
              <div className="admin-card">
                <h3>Process Steps</h3>
                {draft.processSteps.map((step, i) => (
                  <div key={i} className="admin-row">
                    <Field label="Icon">
                      <input value={step.icon} onChange={(e) => updateListItem('processSteps', i, 'icon', e.target.value)} />
                    </Field>
                    <Field label="Title">
                      <input value={step.title} onChange={(e) => updateListItem('processSteps', i, 'title', e.target.value)} />
                    </Field>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'enquiries' && (
            <div className="admin-card">
              <h3>Customer Enquiries</h3>
              {enquiries.length === 0 ? (
                <p style={{ color: '#999' }}>No enquiries yet.</p>
              ) : (
                <div className="enquiry-table-wrap">
                  <table className="enquiry-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Occasion</th>
                      <th>Event Date</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((eq, i) => (
                      <tr key={i}>
                        <td>{new Date(eq.createdAt).toLocaleDateString()}</td>
                        <td>{eq.name}</td>
                        <td>{eq.phone}</td>
                        <td>{eq.occasion}</td>
                        <td>{eq.eventDate}</td>
                        <td>{eq.message}</td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section !== 'enquiries' && (
            <div className="admin-save-bar">
              <button className="btn btn-outline" onClick={() => setDraft(JSON.parse(JSON.stringify(config)))}>Reset</button>
              <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
