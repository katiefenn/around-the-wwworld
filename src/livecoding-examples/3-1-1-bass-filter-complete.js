let oscillator = new OscillatorNode(context, {
  type: "sawtooth"
});


let gain = new GainNode(context, { gain: 0 });

// Create a new BiquadFilterNode and set frequency to 144
let filter = new BiquadFilterNode(context, { frequency: 144 })

// Connect oscillator to filter
// and filter to gain
oscillator.connect(filter);
filter.connect(gain)
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
