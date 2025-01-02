// Create new AudioContext


// Create an OscillatorNode with context and type sawtooth




// Create new GainNode and set gain value to 0


// Connect oscillator to gain


// Connect gain to context.destination


// Start oscillator


handleMIDI = midiData => {
  let end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {
    // Set oscillator frequency value to
    // midiData.input using midiToFrequency


    // Use linearRampToValueAtTime to ramp gain to 1

  } else {
    // Use linearRampToValueAtTime to ramp gain to 0

  }
}
