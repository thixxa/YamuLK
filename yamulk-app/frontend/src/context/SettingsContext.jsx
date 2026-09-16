import { createContext, useContext, useState, useEffect } from 'react';
import { locales } from '../utils/locales';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Load from localStorage or use defaults
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('yamulk_language') || 'en';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('yamulk_fontSize') || 'medium';
  });

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('yamulk_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('yamulk_fontSize', fontSize);
    
    // Apply CSS variable to document root for scaling
    let scale = 1;
    if (fontSize === 'small') scale = 0.9;
    if (fontSize === 'large') scale = 1.1;
    
    document.documentElement.style.setProperty('--font-scale', scale);
  }, [fontSize]);

  // Translation helper function
  const t = (key) => {
    const langDict = locales[language] || locales['en'];
    return langDict[key] || locales['en'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, fontSize, setFontSize, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
