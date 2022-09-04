// Request MIDI access from navigator
navigator.requestMIDIAccess().then(access => {

// Iterate through access.inputs.values
  for (let device of access.inputs.values()) {

// If device.name is 'KeyStep Pro'
    if (device.name === 'KeyStep Pro') {

// Set device.onmidimessage to a callback
      device.onmidimessage = message => {

// Set .debug-midi-event innerText to message.data
        document.querySelector('.debug-midi-event')
          .innerText = message.data.slice(0, 3)
      }
    }
  }
})
