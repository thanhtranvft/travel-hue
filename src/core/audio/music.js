// Original pentatonic phrases inspired by a quiet riverside evening.
// These are not transcriptions of a named ca Hue composition or commercial recordings.
export const backgroundMelody = [
  62,
  null,
  65,
  67,
  69,
  null,
  67,
  65,
  62,
  null,
  60,
  62,
  65,
  null,
  62,
  null,
  69,
  null,
  72,
  74,
  72,
  null,
  69,
  67,
  65,
  null,
  67,
  65,
  62,
  null,
  60,
  null,
];
export const restaurantMelody = [
  74,
  72,
  69,
  null,
  67,
  69,
  72,
  null,
  74,
  77,
  74,
  72,
  69,
  null,
  67,
  null,
];
export const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);
export function pluck(ctx, output, midi, time, volume = 0.12, duration = 1.8) {
  for (const [harmonic, amplitude] of [
    [1, 1],
    [2, 0.23],
    [3, 0.08],
  ]) {
    const oscillator = ctx.createOscillator(),
      envelope = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency(midi) * harmonic, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency(midi) * harmonic * 0.997,
      time + 0.18,
    );
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(
      volume * amplitude,
      time + 0.008,
    );
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      time + duration / harmonic,
    );
    oscillator.connect(envelope).connect(output);
    oscillator.start(time);
    oscillator.stop(time + duration / harmonic + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
}
export function flute(ctx, output, midi, time, volume = 0.07, duration = 1.4) {
  const oscillator = ctx.createOscillator(),
    vibrato = ctx.createOscillator(),
    depth = ctx.createGain(),
    envelope = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency(midi);
  vibrato.frequency.value = 4.7;
  depth.gain.value = 2;
  vibrato.connect(depth).connect(oscillator.detune);
  envelope.gain.setValueAtTime(0.0001, time);
  envelope.gain.linearRampToValueAtTime(volume, time + 0.22);
  envelope.gain.setValueAtTime(volume * 0.8, time + duration * 0.6);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(envelope).connect(output);
  oscillator.start(time);
  vibrato.start(time);
  oscillator.stop(time + duration + 0.02);
  vibrato.stop(time + duration + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    vibrato.disconnect();
    depth.disconnect();
    envelope.disconnect();
  };
}
