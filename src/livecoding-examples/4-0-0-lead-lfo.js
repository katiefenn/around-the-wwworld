// Create a pulse oscillator
let oscillator = createPulseOscillator(context);
// Adjust the width value to 0.01
oscillator.width.value=0.01;

// Create a new GainNode with gain 0
let gain = new GainNode(context, {
  gain: 0
})

// Create a new BiquadFilterNode with
// lowpass type and frequency 6000





// Create a low-frequency OscillatorNode
// with type sine and frequency 5





// Create a new GainNode for lfo to modulate
// with gain 5000




// Connect lfo to lfoGain


// Connect lfoGain to the filter's frequency property


// Start the lfo oscillator


// Connect oscillator to filter
oscillator.connect(filter)

// Connect filter to gain
filter.connect(gain)

// Connect gain to context.destination
gain.connect(context.destination)

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
