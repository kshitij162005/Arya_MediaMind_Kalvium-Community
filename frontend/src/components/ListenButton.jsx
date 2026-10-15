import { useEffect } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { getSpeechState, pauseSpeech, resumeSpeech, speak, speechSupported, stopSpeech, useSpeech } from '../speech';

/**
 * Read-aloud control. `parts` is an array of strings, or a function returning one (evaluated on click).
 * variant "button" (default) for headers, "link" for inline actions like on source cards.
 */
export default function ListenButton({ id, parts, label = 'Listen', variant = 'button' }) {
  const s = useSpeech();

  // Stop if the thing being read disappears (panel closed, new search…).
  useEffect(() => () => {
    if (getSpeechState().id === id) stopSpeech();
  }, [id]);

  if (!speechSupported) return null;

  const mine = s.id === id;
  const paused = mine && s.status === 'paused';
  const start = () => speak(id, typeof parts === 'function' ? parts() : parts);

  if (variant === 'link') {
    return mine ? (
      <span className="listen-inline">
        <button className="link listen-link" onClick={paused ? resumeSpeech : pauseSpeech}>
          {paused ? <Play size={13} /> : <Pause size={13} />} {paused ? 'Resume' : 'Pause'}
        </button>
        <button className="link listen-link" onClick={stopSpeech}><Square size={12} /> Stop</button>
      </span>
    ) : (
      <button className="link listen-link" onClick={start}><Volume2 size={14} /> {label}</button>
    );
  }

  return mine ? (
    <span className="listen-controls">
      <button className="btn ghost small on" onClick={paused ? resumeSpeech : pauseSpeech}>
        {paused ? <Play size={14} /> : <Pause size={14} />}
        {paused ? 'Resume' : 'Pause'}
      </button>
      <button className="icon-btn small" onClick={stopSpeech} title="Stop reading" aria-label="Stop reading">
        <Square size={13} />
      </button>
    </span>
  ) : (
    <button className="btn ghost small" onClick={start} title="Read aloud">
      <Volume2 size={14} /> {label}
    </button>
  );
}
