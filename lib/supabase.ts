import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://oirzsfasipnuyrxkpaas.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcnpzZmFzaXBudXlyeGtwYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODI3NTQsImV4cCI6MjA5Mzc1ODc1NH0.vCLUycnD6MWF2ANH2P_Y880tTHB0QgNHaJNM706zhS4'; 

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') return null; // SSR
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return; // SSR
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return; // SSR
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});