// Create new AudioContext
const context = new AudioContext();

// Create a pulse oscillator
const oscillator = createPulseOscillator(context);
// Adjust the pulse width to 0.01
oscillator.width.value=0.01;

// Create a new GainNode with gain 0
const gainNode = new GainNode(context, {
  gain: 0
})

// Create a new BiquadFilterNode with
// lowpass type and frequency 6000
const filter = new BiquadFilterNode(context, {
  type: 'lowpass',
  frequency: 6000
})

// Create a low-frequency OscillatorNode
// with type sine and frequency 5
const lfo = new OscillatorNode(context, {
  type: 'sine',
  frequency: 5
})

// Create a new GainNode for lfo to modulate
// with gain 5000
const lfoGain = new GainNode(context, {
  gain: 5000
})

// Connect lfo to lfoGain
lfo.connect(lfoGain)

// Connect lgoGain to the filter's frequency property
lfoGain.connect(filter.frequency);

// Start the lfo oscillator
lfo.start();

// Connect oscillator to gainNode
oscillator.connect(filter)

// Connect filter to gainNode
filter.connect(gainNode)

// Connect gainNode to context.destination
gainNode.connect(context.destination)

// Start the oscillator
oscillator.start();

handleMIDI = midiData => {
  const end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    oscillator.frequency.value = midiToFrequency(midiData.input);
    gainNode.gain.linearRampToValueAtTime(0.07, end);
  } else {
    gainNode.gain.linearRampToValueAtTime(0, end);
  }
}
