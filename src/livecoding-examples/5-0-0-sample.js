// Create new AudioContext
const context = new AudioContext();

// Fetch /src/samples/Clap.wav

  // ...then resolve response to an ArrayBuffer

  // ...then use context to decode audio data from buffer


function playSample (context, buffer) {
    // Create new AudioBufferSourceNode and
    // assign buffer to the source node buffer

    // Connect the source node to the destination

    // Start the source node

}

handleMIDI = midiData => {
  const end = context.currentTime + 0.1
  if (isKeyDown(midiData)) {
    // Call playSample can pass in context and buffer

  }
}
