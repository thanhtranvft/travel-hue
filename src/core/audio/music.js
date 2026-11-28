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
// Gentle pastoral countryside motif (G major pentatonic: G4 A4 B4 D5 E5 G5)
export const countrysideFishingMelody = [
  67,
  null,
  69,
  71,
  74,
  null,
  76,
  74,
  71,
  null,
  69,
  67,
  69,
  null,
  67,
  null,
  74,
  null,
  76,
  79,
  76,
  null,
  74,
  71,
  69,
  null,
  71,
  69,
  67,
  null,
  64,
  null,
];
export const countrysideFishingBass = [43, 47, 45, 50];
// Gentle acoustic Huế cafe lounge motif (C major pentatonic)
export const cafeLoungeMelody = [
  64,
  null,
  67,
  71,
  69,
  null,
  67,
  null,
  72,
  null,
  74,
  72,
  69,
  null,
  67,
  null,
  64,
  null,
  67,
  69,
  71,
  null,
  69,
  67,
  64,
  null,
  60,
  64,
  67,
  null,
  64,
  null,
];
export const cafeLoungeBass = [48, 45, 50, 43];
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
