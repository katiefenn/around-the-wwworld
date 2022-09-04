// Create new AudioContext
const context = new AudioContext();

let kickBuffer = await fetch('/src/samples/Kick-LM2.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let clapBuffer = await fetch('/src/samples/Clap.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let clap707Buffer = await fetch('/src/samples/Clap-707.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let hatBuffer = await fetch('/src/samples/HighHat.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let hat707Buffer = await fetch('/src/samples/HighHat-707.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));

function playSample (context, buffer, gain = 1) {
    const source = context.createBufferSource();
    const gainNode = new GainNode(context);
    gainNode.gain.value = gain;
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start();
}

handleMIDI = midiData => {
  const end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    if (midiData.input === 48) playSample(context, kickBuffer)
    if (midiData.input === 50) playSample(context, clapBuffer)
    if (midiData.input === 52) playSample(context, hatBuffer)
    if (midiData.input === 53) playSample(context, hat707Buffer)
    if (midiData.input === 55) playSample(context, clap707Buffer)
  }
}
