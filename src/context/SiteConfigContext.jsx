import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import defaultConfig from '../data/defaultConfig.json';

const SiteConfigContext = createContext(null);
const STORAGE_KEY = 'sweetheaven_site_config';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/config?t=${Date.now()}`);
      setConfig(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    } catch { /* fallback */ }
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) setConfig(JSON.parse(cached));
  }, []);

  useEffect(() => {
    loadConfig().finally(() => setLoading(false));
  }, [loadConfig]);

  const authenticate = useCallback(async (password) => {
    await apiRequest('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  }, []);

  const saveConfig = async (newConfig, password) => {
    await apiRequest('/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
      body: JSON.stringify(newConfig),
    });
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    return newConfig;
  };

  const uploadImage = async (file, password) => {
    const result = await apiRequest('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-Admin-Password': password,
        'X-File-Name': file.name,
      },
      body: file,
    });
    return result.url;
  };

  const submitEnquiry = async (formData) => {
    const msg = encodeURIComponent(
      `Hi! I'd like a cake quote.\nName: ${formData.name}\nPhone: ${formData.phone}\nOccasion: ${formData.occasion}\nDate: ${formData.eventDate}\nMessage: ${formData.message || '—'}`
    );
    const phone = (config.social?.whatsapp || '').replace(/\D/g, '').slice(-12) || '918209046188';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    return { success: true, via: 'whatsapp' };
  };

  const getEnquiries = async () => [];

  return (
    <SiteConfigContext.Provider
      value={{ config, loading, error, authenticate, saveConfig, uploadImage, submitEnquiry, getEnquiries, reloadConfig: loadConfig }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig must be used within SiteConfigProvider');
  return ctx;
}
