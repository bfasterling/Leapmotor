/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Synthesizes a futuristic premium alert chime using Web Audio API.
 * This ensures audio warning works natively on any desktop/mobile browser
 * without relying on external static audio files.
 */
export function playNewLeadAlert() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play sound 1: short rising chime (A4 to A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime); 
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); 
    
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);
    
    // Play sound 2 (slightly offset): high futuristic synth ping
    const delayTime = 120; // ms
    setTimeout(() => {
      try {
        const ctx2 = new AudioContextClass();
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(587.33, ctx2.currentTime); // D5
        osc2.frequency.exponentialRampToValueAtTime(1200, ctx2.currentTime + 0.12); 
        
        gain2.gain.setValueAtTime(0.25, ctx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.3);
        
        osc2.start(ctx2.currentTime);
        osc2.stop(ctx2.currentTime + 0.32);
      } catch (e) {
        // Quiet catch if multiple sounds play
      }
    }, delayTime);

  } catch (e) {
    console.warn("Audio Context blocked or not supported:", e);
  }
}

/**
 * Speech synthesis to announce the name of the registered customer
 * to provide an incredibly advanced and vanguardist experience.
 */
export function speakNewLeadAnnouncement(clientName: string) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any current speech
      const text = `Nuevo registro: ${clientName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
}
