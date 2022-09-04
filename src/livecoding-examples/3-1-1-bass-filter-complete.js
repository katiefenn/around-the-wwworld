
const context = new AudioContext();


const oscillator = new OscillatorNode(context, {
  type: "sawtooth"
});


const gainNode = new GainNode(context);


gainNode.gain.value = 0;

// Create a new BiquadFilterNode
const filterNode = new BiquadFilterNode(context)

// Set filter.frequency to 144Hz
filterNode.frequency.value = 144;

// Connect oscillator to filter
// and filter to gainNode
oscillator.connect(filterNode);
filterNode.connect(gainNode)

gainNode.connect(context.destination);


oscillator.start();

handleMIDI = midiData => {
  const end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {


    oscillator.frequency.value = midiToFrequency(midiData.input);


    gainNode.gain.linearRampToValueAtTime(1, end);
  } else {

    gainNode.gain.linearRampToValueAtTime(0, end);
  }
}
