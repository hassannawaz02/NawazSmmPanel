import { createContext, useContext, useState, useEffect } from 'react';
import { siteSettingsAPI } from '../services/api';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: localStorage.getItem('site_name') || 'Nawaz SMM',
    siteTagline: localStorage.getItem('site_tagline') || '',
  });

  const loadSettings = async () => {
    try {
      const res = await siteSettingsAPI.get();
      const data = {
        siteName: res.data.data.siteName || 'Nawaz SMM',
        siteTagline: res.data.data.siteTagline || '',
      };
      setSettings(data);
      localStorage.setItem('site_name', data.siteName);
      localStorage.setItem('site_tagline', data.siteTagline);
      document.title = data.siteName;
    } catch (error) {
      document.title = settings.siteName;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
