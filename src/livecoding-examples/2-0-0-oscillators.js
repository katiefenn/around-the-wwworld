// Start context


// Create an OscillatorNode with context and type sine




// Create new GainNode


// Set gain to 0


// Connect oscillator to gainNode


// Connect gainNode to context.destination


// Start oscillator


handleMIDI = midiData => {
  const end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {
    // Set oscillator frequency to midiData.input
    // using midiToFrequency


    // Use linearRampToValueAtTime to ramp gain to 1

  } else {
    // Use linearRampToValueAtTime to ramp gain to 0

  }
}
