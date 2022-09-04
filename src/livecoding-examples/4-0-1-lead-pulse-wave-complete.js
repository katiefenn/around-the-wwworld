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

// Connect oscillator to gainNode
oscillator.connect(gainNode)

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
