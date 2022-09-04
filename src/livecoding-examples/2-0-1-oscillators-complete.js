// Create new AudioContext
const context = new AudioContext();

// Create an OscillatorNode with context and type sine
const oscillator = new OscillatorNode(context, {
  type: "sine"
});

// Create new GainNode
const gainNode = new GainNode(context);

// Set gain to 0
gainNode.gain.value = 0;

// Connect oscillator to gainNode
oscillator.connect(gainNode);

// Connect gainNode to context.destination
gainNode.connect(context.destination);

// Start oscillator
oscillator.start();

handleMIDI = midiData => {
  const end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {
    // Set oscillator frequency to midiData.input
    // using midiToFrequency
    oscillator.frequency.value = midiToFrequency(midiData.input);

    // Use linearRampToValueAtTime to ramp gain to 1
    gainNode.gain.linearRampToValueAtTime(1, end);
  } else {
    // Use linearRampToValueAtTime to ramp gain to 0
    gainNode.gain.linearRampToValueAtTime(0, end);
  }
}
