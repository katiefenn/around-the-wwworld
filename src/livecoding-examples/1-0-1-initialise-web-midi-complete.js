// await MIDI Access from navigator
let access = await navigator.requestMIDIAccess();

// Iterate through access.inputs.values
for (let device of access.inputs.values()) {

// If device.name is 'KeyStep Pro'
  if (device.name === 'KeyStep Pro') {

// Set device.onmidimessage to a callback
    device.onmidimessage = message => {

// Create normal Array "data" from Uint8Array
      const data = Array.from(message.data)

// Set .debug-midi-event innerText to message.data.slice(0, 3)
      document.querySelector('.debug-midi-event')
        .innerText = data
    }
  }
}
