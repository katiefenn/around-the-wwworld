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

// Create DelayNode and GainNode for 0.3 time, 0.2 gain and connect
const delay1 = new DelayNode(context, { delayTime: 0.3 });
const delay1Gain = new GainNode(context, { gain: 0.2 });
delay1.connect(delay1Gain);

// Create DelayNode and GainNode for 0.6 time, 0.1 gain and connect
const delay2 = new DelayNode(context, { delayTime: 0.6 });
const delay2Gain = new GainNode(context, { gain: 0.1 });
delay2.connect(delay2Gain);

// Connect gainNode to context.destination
gainNode.connect(context.destination)

// Connect filter to delay1 and delay2
gainNode.connect(delay1);
gainNode.connect(delay2);

// Connect delay1Gain and delay2Gain to context.destination
delay1Gain.connect(context.destination);
delay2Gain.connect(context.destination);

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
