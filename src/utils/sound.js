// Simple synthesized sounds using Web Audio API

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const playTone = (freq, type, duration, startTime = 0) => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
};

export const playCompletionSound = () => {
    // Simple high pitch success chime
    playTone(880, 'sine', 0.1, 0); // A5
    playTone(1108, 'sine', 0.3, 0.1); // C#6
};

export const playStreakSound = (days) => {
    // Milestone sounds based on streak length
    if (days === 3) {
        // Minor chord arpeggio
        playTone(440, 'triangle', 0.2, 0);
        playTone(554, 'triangle', 0.2, 0.1);
        playTone(659, 'triangle', 0.4, 0.2);
    } else if (days >= 7 && days % 7 === 0) {
        // Weekly fanfare (Major)
        playTone(523.25, 'square', 0.1, 0); // C5
        playTone(659.25, 'square', 0.1, 0.1); // E5
        playTone(783.99, 'square', 0.1, 0.2); // G5
        playTone(1046.50, 'square', 0.4, 0.3); // C6
    }
};
