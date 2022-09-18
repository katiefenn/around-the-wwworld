// Change oscillator type to sawtooth
let oscillator = new OscillatorNode(context, {
  type: "sine"
});


let gain = new GainNode(context, { gain: 0 });


oscillator.connect(gain);


gain.connect(context.destination);


oscillator.start();

handleMIDI = midiData => {
  let end = context.currentTime + 0.005;

  if (isKeyDown(midiData)) {


    oscillator.frequency.value = midiToFrequency(midiData.input);


    gain.gain.linearRampToValueAtTime(1, end);
  } else {

    gain.gain.linearRampToValueAtTime(0, end);
  }
}
