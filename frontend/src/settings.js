import { setSpeechOptions } from './speech';

// UI preferences. Stored per browser; they only change how the app looks and behaves for this viewer.
const KEY = 'mm_settings';

export const ACCENTS = {
  blue: { label: 'Blue', value: '#4b7fe5' },
  violet: { label: 'Violet', value: '#7c5ce6' },
  teal: { label: 'Teal', value: '#13a090' },
  green: { label: 'Green', value: '#2f9e5f' },
  amber: { label: 'Amber', value: '#d18a1a' },
  rose: { label: 'Rose', value: '#e0507a' },
};

export const DEFAULT_SETTINGS = {
  theme: 'system', // system | light | dark
  accent: 'blue',
  density: 'comfortable', // comfortable | compact
  fontSize: 'default', // small | default | large
  answerFont: 'serif', // serif | sans
  showRelated: true, // list retrieved-but-uncited sources
  showScores: true, // show "% match" on source cards
  webFallback: true, // offer web search when the archive has no answer
  showOverview: true, // dashboard on the search home screen
  voice: '', // read-aloud voiceURI; '' = system default
  speechRate: 1,
};

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable (private mode etc.); settings still apply for this session */
  }
}

export function applySettings(s) {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.dataset.density = s.density;
  root.dataset.fontSize = s.fontSize;
  root.dataset.answerFont = s.answerFont;
  root.style.setProperty('--accent', (ACCENTS[s.accent] ?? ACCENTS.blue).value);
  setSpeechOptions({ rate: s.speechRate, voiceURI: s.voice });
}
