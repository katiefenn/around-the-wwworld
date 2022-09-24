// Create a pulse oscillator
let oscillator = createPulseOscillator(context);
// Adjust the pulse width to 0.01
oscillator.width.value=0.01;

// Create a new GainNode with gain 0
let gain = new GainNode(context, {
  gain: 0
})

// Create a new BiquadFilterNode with
// lowpass type and frequency 6000
let filter = new BiquadFilterNode(context, {
  type: 'lowpass',
  frequency: 6000
})

// Create a low-frequency OscillatorNode
// with type sine and frequency 5
let lfo = new OscillatorNode(context, {
  type: 'sine',
  frequency: 5
})

// Create a new GainNode for lfo to modulate
// with gain 5000
let lfoGain = new GainNode(context, {
  gain: 5000
})

// Connect lfo to lfoGain
lfo.connect(lfoGain)

// Connect lgoGain to the filter's frequency property
lfoGain.connect(filter.frequency);

// Start the lfo oscillator
lfo.start();

// Connect oscillator to gain
oscillator.connect(filter)

// Connect filter to gain
filter.connect(gain)

// Create DelayNode and GainNode for 0.3 delayTime, 0.2 gain and connect
let delay1 = new DelayNode(context, { delayTime: 0.3 });
let delay1Gain = new GainNode(context, { gain: 0.2 });
delay1.connect(delay1Gain);

// Create DelayNode and GainNode for 0.6 delayTime, 0.1 gain and connect
let delay2 = new DelayNode(context, { delayTime: 0.6 });
let delay2Gain = new GainNode(context, { gain: 0.1 });
delay2.connect(delay2Gain);

// Connect gain to context.destination
gain.connect(context.destination)

// Connect gain to delay1 and delay2
gain.connect(delay1);
gain.connect(delay2);

// Connect delay1Gain and delay2Gain to context.destination
delay1Gain.connect(context.destination);
delay2Gain.connect(context.destination);

// Start the oscillator
oscillator.start();

handleMIDI = midiData => {
  let end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    oscillator.frequency.value = midiToFrequency(midiData.input);
    gain.gain.linearRampToValueAtTime(0.07, end);
  } else {
    gain.gain.linearRampToValueAtTime(0, end);
  }
}
