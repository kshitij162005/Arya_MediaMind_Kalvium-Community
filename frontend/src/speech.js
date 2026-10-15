// Read-aloud using the browser's built-in Web Speech API: free, unlimited, no API key, works offline
// with the operating system's voices. One thing plays at a time; components subscribe with useSpeech().
import { useEffect, useState, useSyncExternalStore } from 'react';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
export const speechSupported = Boolean(synth);

// id: what is playing, status: idle | playing | paused, index: which part is being read (for highlighting)
let state = { id: null, status: 'idle', index: -1 };
const listeners = new Set();
const update = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getSpeechState = () => state;
export const useSpeech = () => useSyncExternalStore(subscribe, getSpeechState);

let options = { rate: 1, voiceURI: '' };
export const setSpeechOptions = (o) => {
  options = { ...options, ...o };
};

// Chrome stops long utterances after ~15 s, so text is spoken in short sentence-sized pieces.
const MAX_CHUNK = 220;
function splitText(text) {
  const clean = text.replace(/…/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+["”’')\]]*|[^.!?]+$/g) ?? [clean];
  const chunks = [];
  for (let s of sentences.map((x) => x.trim()).filter(Boolean)) {
    while (s.length > MAX_CHUNK) {
      const cut = Math.max(s.lastIndexOf(', ', MAX_CHUNK), s.lastIndexOf(' ', MAX_CHUNK));
      const at = cut > 40 ? cut + 1 : MAX_CHUNK;
      chunks.push(s.slice(0, at).trim());
      s = s.slice(at).trim();
    }
    if (s) chunks.push(s);
  }
  return chunks;
}

let session = 0; // bumps on every start/stop so callbacks from cancelled speech are ignored

export function stopSpeech() {
  if (!synth) return;
  session++;
  synth.cancel();
  update({ id: null, status: 'idle', index: -1 });
}

/** Speak `parts` (array of strings). state.index reports which part is being read. */
export function speak(id, parts) {
  if (!synth) return;
  stopSpeech();
  const mine = session;
  const queue = parts.flatMap((p, i) => splitText(p ?? '').map((text) => ({ text, i })));
  if (!queue.length) return;
  const voice = options.voiceURI ? synth.getVoices().find((v) => v.voiceURI === options.voiceURI) : null;
  let k = 0;

  const next = () => {
    if (mine !== session) return;
    if (k >= queue.length) {
      update({ id: null, status: 'idle', index: -1 });
      return;
    }
    const { text, i } = queue[k++];
    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = options.rate;
    u.onstart = () => mine === session && update({ index: i });
    u.onend = next;
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') next();
    };
    synth.speak(u);
  };

  update({ id, status: 'playing', index: queue[0].i });
  next();
}

export function pauseSpeech() {
  if (!synth || state.status !== 'playing') return;
  synth.pause();
  update({ status: 'paused' });
}

export function resumeSpeech() {
  if (!synth || state.status !== 'paused') return;
  synth.resume();
  update({ status: 'playing' });
}

// Don't keep talking after a reload or navigation.
if (synth) window.addEventListener('pagehide', () => synth.cancel());

/** Installed voices; they load asynchronously in some browsers. */
export function useVoices() {
  const [voices, setVoices] = useState(() => synth?.getVoices() ?? []);
  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);
  return voices;
}
