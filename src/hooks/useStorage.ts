import { useState, useEffect } from 'react';
import { HistoryItem, AppSettings } from '../types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('sizepilot_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sizepilot_history', JSON.stringify(history));
  }, [history]);

  const addHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev].slice(0, 50)); // Keep last 50
  };

  const clearHistory = () => setHistory([]);
  const removeItem = (id: string) => setHistory(prev => prev.filter(i => i.id !== id));

  return { history, addHistoryItem, clearHistory, removeItem };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sizepilot_settings');
    return saved ? JSON.parse(saved) : {
      defaultMode: 'balanced',
      defaultFormat: 'original',
      autoDownload: false,
      privacyMode: true
    };
  });

  useEffect(() => {
    localStorage.setItem('sizepilot_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}