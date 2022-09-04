
const context = new AudioContext();

// Change oscillator type to sawtooth
const oscillator = new OscillatorNode(context, {
  type: "sawtooth"
});


const gainNode = new GainNode(context);


gainNode.gain.value = 0;


oscillator.connect(gainNode);


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
