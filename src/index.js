import MIDIAccess from './midi-access.js'

window.keyDown = () => {};
window.keyUp = () => {};
window.handleMIDI = () => {};

// Start global MIDI Access
const midiAccess = new MIDIAccess({ onDeviceInput: midiData => window.handleMIDI(midiData) });

midiAccess.start();

// Start global AudioContext
document.querySelector('#restart-audio-context').addEventListener('click', event => {
  window.context = new (window.AudioContext || window.webkitAudioContext)();
  event.target.remove()
});

const isKeyUpOrKeyDown = d => d.type >= 128 && d.type < 160;
window.isKeyDown = d => isKeyUpOrKeyDown(d) && d.type >= 144;

window.midiToFrequency = await import('/src/midi-to-frequency.js').then(m => m.default);
window.createPulseOscillator = await import('/src/pulse-oscillator.js').then(m => m.default);

Array.from(document.querySelectorAll('.image-description')).forEach(element => { const wrappedElement = `<div class="image-description-wrapper">${element.outerHTML}</div>`; element.outerHTML = wrappedElement; })
Array.from(document.querySelectorAll('.image-description-wrapper')).forEach(element => { const background = document.createElement('div'); background.classList.add('image-description-background'); element.prepend(background) })
