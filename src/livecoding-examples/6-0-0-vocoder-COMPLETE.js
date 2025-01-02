// Create a pulse oscillator
// PulseOscillator from Andy Harman
//let oscillator = new OscillatorNode(context, { type: 'sawtooth' })
let oscillator = createPulseOscillator(context);
// Adjust the width value to 0.01
oscillator.width.value=0.75;

// Create a new GainNode with gain 0
let gain = new GainNode(context, {
  gain: 0
})

// Connect filter to gain
oscillator.connect(gain)

// Connect gain to context.destination
gain.connect(context.destination)

// Start the oscillator
oscillator.start();

noteStack = [];

handleMIDI = midiData => {
  let end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    if (noteStack.length < 1) {
      gain.gain.linearRampToValueAtTime(1, end);
    }

    noteStack.push(midiData.input);
  } else {
    noteStack = noteStack.filter(note => note !== midiData.input);
    if (noteStack.length < 1) {
      gain.gain.linearRampToValueAtTime(0, end);
    }
  }

  console.log('noteStack: ', noteStack);

  if (noteStack.length > 0) {
    oscillator.frequency.value = midiToFrequency(noteStack[noteStack.length - 1]);
  }
}
