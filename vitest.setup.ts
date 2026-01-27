import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SpeechSynthesis
const speechMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
};
Object.defineProperty(window, 'speechSynthesis', {
  value: speechMock,
  writable: true,
});

// Mock SpeechSynthesisUtterance
class SpeechSynthesisUtteranceMock {
  lang: string = '';
  text: string = '';
  onend: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: SpeechSynthesisUtteranceMock,
  writable: true,
});

// Mock AudioContext
class AudioContextMock {
  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: '',
    frequency: { setValueAtTime: vi.fn() },
  }));
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  }));
  currentTime = 0;
  destination = {};
}
Object.defineProperty(window, 'AudioContext', {
  value: AudioContextMock,
  writable: true,
});
Object.defineProperty(window, 'webkitAudioContext', {
  value: AudioContextMock,
  writable: true,
});

// Mock NoSleep
vi.mock('nosleep.js', () => {
  return {
    default: class NoSleep {
      enable = vi.fn();
      disable = vi.fn();
    },
  };
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
