// Create new AudioContext
let context = new AudioContext();

// Create an OscillatorNode with context and type sawtooth
let oscillator = new OscillatorNode(context, {
  type: "sawtooth"
});

// Create new GainNode and set gain value to 0
let gain = new GainNode(context, { gain: 0 });

// Connect oscillator to gain
oscillator.connect(gain);

// Connect gain to context.destination
gain.connect(context.destination);

// Start oscillator
oscillator.start();

handleMIDI = midiData => {
  let end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {
    // Set oscillator frequency value to
    // midiData.input using midiToFrequency
    oscillator.frequency.value = midiToFrequency(midiData.input - 12);

    // Use linearRampToValueAtTime to ramp gain to 1
    gain.gain.linearRampToValueAtTime(1, end);
  } else {
    // Use linearRampToValueAtTime to ramp gain to 0
    gain.gain.linearRampToValueAtTime(0, end);
  }
}
