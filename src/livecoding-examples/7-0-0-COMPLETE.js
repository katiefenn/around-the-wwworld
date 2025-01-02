let createPulseOscillator = await import('http://localhost:8000/src/pulse-oscillator.js').then(m => m.default);
let midiToFrequency = await import('http://localhost:8000/src/midi-to-frequency.js').then(m => m.default);

let kickBuffer = await fetch('http://localhost:8000/src/samples/Kick-LM2.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let clapBuffer = await fetch('http://localhost:8000/src/samples/Clap.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let clap707Buffer = await fetch('http://localhost:8000/src/samples/Clap-707.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let hatBuffer = await fetch('http://localhost:8000/src/samples/HighHat.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let hat707Buffer = await fetch('http://localhost:8000/src/samples/HighHat-707.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));
let vocoderBuffer = await fetch('http://localhost:8000/src/samples/Vocoder-talkie.wav').then(resp => resp.arrayBuffer()).then(buffer => context.decodeAudioData(buffer));

let isKeyUpOrKeyDown = d => d.type >= 128 && d.type < 160;
let getMidiChannel = d => d.type % 16;
let isKeyDown = d => isKeyUpOrKeyDown(d) && d.type >= 144;
let isControlChannel = d => d.type === 176;

let getGlobalFilterFreq = midiVal => (midiVal / 127) * 10000;
let globalFilter = new BiquadFilterNode(context);
globalFilter.frequency.value = getGlobalFilterFreq(127);

let globalGain = new GainNode(context);
globalGain.gain.value = 1;

let bassMix = 0.3;
let leadMix = 0.3;
let backingMix = 0.4;
let kickMix = 0.7;
let hatMix = 1;
let clapMix = 0.6;
let hat707Mix = 0.9;
let clap707Mix = 0.9;
let vocoderMix = 0.05;

class Lead {
  constructor (context) {
    let oscillator = createPulseOscillator(context);
    oscillator.width.value=0.01;

    let gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, context.currentTime);

    let filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 6000;

    let lfo = context.createOscillator();
    let lfoGain = context.createGain();
    lfoGain.gain.value = 5000;
    lfo.connect(lfoGain);
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    lfoGain.connect(filter.frequency);
    lfo.start();

    let delay1 = new DelayNode(context, { delayTime: 0.3 });
    let delay1Gain = new GainNode(context, { gain: 0.2 });
    let delay2 = new DelayNode(context, { delayTime: 0.6 });
    let delay2Gain = new GainNode(context, { gain: 0.1 });

    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(globalFilter);
    filter.connect(delay1);
    filter.connect(delay2);
    filter.connect(globalFilter);
    delay1.connect(delay1Gain);
    delay1Gain.connect(globalFilter);
    delay2.connect(delay2Gain);
    delay2Gain.connect(globalFilter);

    oscillator.start();

    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        oscillator.frequency.value = midiToFrequency(midiData.input);
        gainNode.gain.linearRampToValueAtTime(0.07 * leadMix, context.currentTime + 0.1);
      } else {
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);
      }
    }
  }
}

class Bass {
  constructor (context) {
    let oscillator1 = new OscillatorNode(context);
    oscillator1.type = "sawtooth";

    let oscillator2 = new OscillatorNode(context);
    oscillator2.type = "sawtooth";

    let filter1 = new BiquadFilterNode(context, {
      type: "lowpass",
      frequency: (1.7 / 127) * 10800
    });

    let gainNode1 = context.createGain();
    gainNode1.gain.setValueAtTime(0, context.currentTime);

    let gainNode2 = context.createGain();
    gainNode2.gain.setValueAtTime(0, context.currentTime);

    oscillator1.connect(gainNode1);
    gainNode1.connect(filter1);
    filter1.connect(globalFilter);
    oscillator1.start();

    oscillator2.connect(gainNode2);
    gainNode2.connect(filter1);
    oscillator2.start();

    let noteStack = [];

    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        if (noteStack.length < 1) {
          gainNode1.gain.linearRampToValueAtTime(0.30 * bassMix, context.currentTime + 0.005);
          gainNode2.gain.linearRampToValueAtTime(((8 / 127) * 1) * bassMix, context.currentTime + 0.005)
          filter1.frequency.linearRampToValueAtTime((2 / 127) * 10800, context.currentTime + 0.5)
        }

        noteStack.push(midiData.input);
      } else {
        noteStack = noteStack.filter(note => note !== midiData.input);
        if (noteStack.length < 1) {
          gainNode1.gain.linearRampToValueAtTime(0, context.currentTime + 0.005);
          gainNode2.gain.linearRampToValueAtTime(0, context.currentTime + 0.005);
          filter1.frequency.value = (1.7 / 127) * 10800;
        }
      }

      console.log('noteStack: ', noteStack);

      if (noteStack.length > 0) {
        oscillator1.frequency.value = midiToFrequency(noteStack[noteStack.length - 1]);
        oscillator2.frequency.value = midiToFrequency(noteStack[noteStack.length - 1] - 12);
      }
    }
  }
}

class Backing {
  constructor (context, frequency = 0.5, gain = 0.04) {
    let oscillator = new OscillatorNode(context);
    oscillator.type = "sawtooth";

    let gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, context.currentTime);

    let filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    let lfo = context.createOscillator();
    let lfoGain = context.createGain();
    lfoGain.gain.value = 1700;
    lfo.connect(lfoGain);
    lfo.type = 'sine';
    lfo.frequency.value = frequency;
    lfoGain.connect(filter.frequency);
    lfo.start();

    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(globalFilter);

    oscillator.start();

    let noteStack = [];

    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        if (noteStack.length < 1) {
          gainNode.gain.linearRampToValueAtTime(gain * backingMix, context.currentTime + 0.1);
        }

        noteStack.push(midiData.input);
      } else {
        noteStack = noteStack.filter(note => note !== midiData.input);
        if (noteStack.length < 1) {
          gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);
        }
      }

      console.log('noteStack: ', noteStack);

      if (noteStack.length > 0) {
        oscillator.frequency.value = midiToFrequency(noteStack[noteStack.length - 1]);
      }
    }
  }
}

class Sample {
  constructor(context, buffer, gain = 1) {
    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        let source = context.createBufferSource();
        let gainNode = new GainNode(context);
        gainNode.gain.value = gain;
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(globalFilter);
        source.start();
      }
    }
  }
}

class Noise {
  constructor (context) {
    let bufferSize = context.sampleRate * 5;
    let buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.handleMIDI = (midiData) => {
      let noise = context.createBufferSource();
      noise.buffer = buffer;

      let hpf = new BiquadFilterNode(context);
      hpf.type = "highpass"
      hpf.frequency.value = 50;

      let lpf = new BiquadFilterNode(context);
      lpf.type = "lowpass"
      lpf.frequency.value = 50;

      let lfoFilter = new BiquadFilterNode(context);
      lfoFilter.frequency.value = 3700;
      let lfo = context.createOscillator();
      let lfoGain = context.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfo.type = 'sine';
      lfo.frequency.value = 20;
      lfoGain.connect(lfoFilter.frequency);
      lfo.start();

      let gainNode = new GainNode(context);
      gainNode.gain.value = 0;

      noise.connect(lfoFilter);
      lfoFilter.connect(lpf);
      lpf.connect(hpf);
      hpf.connect(gainNode);
      gainNode.connect(context.destination);
      noise.start();

      if (isKeyDown(midiData)) {
        gainNode.gain.linearRampToValueAtTime(1, context.currentTime + 0.005);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 1);
        lpf.frequency.linearRampToValueAtTime(1500, context.currentTime + 0.5);
        hpf.frequency.linearRampToValueAtTime(20000, context.currentTime + 2);
      }
    }

  }
}

let lead = new Lead(context);
let bass = new Bass(context);
let backing1 = new Backing(context);
let backing2 = new Backing(context, 0.5, 0.03);
let kick = new Sample(context, kickBuffer, 1 * kickMix);
let clap = new Sample(context, clapBuffer, 1 * clapMix);
let clap707 = new Sample(context, clap707Buffer, 1 * clap707Mix);
let hat = new Sample(context, hatBuffer, 1 * hatMix);
let hat707 = new Sample(context, hat707Buffer, 1 * hat707Mix);
let vocoder = new Sample(context, vocoderBuffer, 3 * vocoderMix);
let noise = new Noise(context);

globalFilter.connect(globalGain);
globalGain.connect(context.destination);

handleMIDI = (midiData) => {
  if (midiData.input) {
    console.log('MIDI event: ', midiData);
  }

  let midiHandlers = [
    () => {},
    lead.handleMIDI,
    bass.handleMIDI,
    midiData => {
      let { type, input, value } = midiData;
      if (input > 60) {
        backing1.handleMIDI({ type, input: input - 0, value});
      } else {
        backing2.handleMIDI({ type, input, value});
      }
    },
    () => {},
    () => {},
    () => {},
    () => {},
    () => {},
    (midiData) => {
      if (midiData.input === 36) kick.handleMIDI(midiData);
      if (midiData.input === 38) clap.handleMIDI(midiData);
      if (midiData.input === 40) hat.handleMIDI(midiData);
      if (midiData.input === 41) hat707.handleMIDI(midiData);
      if (midiData.input === 43) clap707.handleMIDI(midiData);
      if (midiData.input === 47) vocoder.handleMIDI(midiData);
      if (midiData.input === 48) noise.handleMIDI(midiData);
    }
  ];

  if (isKeyUpOrKeyDown(midiData) && midiHandlers[getMidiChannel(midiData)]) {
      midiHandlers[getMidiChannel(midiData)](midiData);
  }

  if (isControlChannel(midiData)) {
    if (midiData.input === 77) {
      globalGain.gain.value = (1 / 127) * midiData.value;
    }
    if (midiData.input === 78) {
      globalFilter.frequency.value = getGlobalFilterFreq(midiData.value * 2)
    }
  }
};
