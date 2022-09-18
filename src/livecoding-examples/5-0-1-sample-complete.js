// Fetch /src/samples/Clap.wav
let clapBuffer = await fetch('/src/samples/Clap.wav')
  // ...then resolve response to an ArrayBuffer
  .then(resp => resp.arrayBuffer())
  // ...then use context to decode audio data from buffer
  .then(buffer => context.decodeAudioData(buffer))

function playSample (context, buffer) {
    // Create new AudioBufferSourceNode and
    // assign buffer to the source node buffer
    let source = new AudioBufferSourceNode(context, { buffer });
    // Connect the source node to the destination
    source.connect(context.destination);
    // Start the source node
    source.start();
}

handleMIDI = midiData => {
  let end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    // Call playSample can pass in context and buffer
    playSample(context, clapBuffer)
  }
}
