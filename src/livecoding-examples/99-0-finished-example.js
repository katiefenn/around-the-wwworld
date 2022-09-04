let kickBuffer = await fetch('http://localhost:8000/src/samples/Kick-LM2.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));
let clapBuffer = await fetch('http://localhost:8000/src/samples/Clap.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));
let clap707Buffer = await fetch('http://localhost:8000/src/samples/Clap-707.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));
let hatBuffer = await fetch('http://localhost:8000/src/samples/HighHat.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));
let hat707Buffer = await fetch('http://localhost:8000/src/samples/HighHat-707.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));
let vocoderBuffer = await fetch('http://localhost:8000/src/samples/Vocoder.wav').then(resp => resp.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer));

const isKeyUpOrKeyDown = d => d.type >= 128 && d.type < 160;
const getMidiChannel = d => d.type % 16;
const isKeyDown = d => isKeyUpOrKeyDown(d) && d.type >= 144;
const isControlChannel = d => d.type === 176;

const getGlobalFilterFreq = midiVal => (midiVal / 127) * 10000;
const globalFilter = new BiquadFilterNode(audioCtx);
globalFilter.frequency.value = getGlobalFilterFreq(1);

const globalGain = new GainNode(audioCtx);
globalGain.gain.value = 1;

class Lead {
  constructor (audioCtx) {
    const oscillator = createPulseOscillator(audioCtx);
    oscillator.width.value=0.01;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 6000;

    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 5000;
    lfo.connect(lfoGain);
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    lfoGain.connect(filter.frequency);
    lfo.start();

    const delay1 = new DelayNode(audioCtx, { delayTime: 0.3 });
    const delay1Gain = new GainNode(audioCtx, { gain: 0.2 });
    const delay2 = new DelayNode(audioCtx, { delayTime: 0.6 });
    const delay2Gain = new GainNode(audioCtx, { gain: 0.1 });

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
        gainNode.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.1);
      } else {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
      }
    }
  }
}

class Bass {
  constructor (audioCtx) {
    const oscillator1 = new OscillatorNode(audioCtx);
    oscillator1.type = "sawtooth";

    const oscillator2 = new OscillatorNode(audioCtx);
    oscillator2.type = "sawtooth";

    const filter1 = new BiquadFilterNode(audioCtx, {
      type: "lowpass",
      frequency: (1.7 / 127) * 10800
    });

    const filter2 = new BiquadFilterNode(audioCtx, {
      type: "lowpass",
      frequency: (1.7 / 127) * 10800
    });

    const gainNode1 = audioCtx.createGain();
    gainNode1.gain.setValueAtTime(0, audioCtx.currentTime);

    const gainNode2 = audioCtx.createGain();
    gainNode2.gain.setValueAtTime(0, audioCtx.currentTime);

    oscillator1.connect(gainNode1);
    gainNode1.connect(filter1);
    filter1.connect(globalFilter);
    oscillator1.start();

    oscillator2.connect(gainNode2);
    gainNode2.connect(filter2);
    filter2.connect(globalFilter);
    oscillator2.start();

    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        gainNode1.gain.linearRampToValueAtTime(0.30, audioCtx.currentTime + 0.005);
        gainNode2.gain.linearRampToValueAtTime((8 / 127) * 1, audioCtx.currentTime + 0.005);
      } else {
        gainNode1.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.005);
        gainNode2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.005);
      }
    }

    let noteStack = [];

    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        if (noteStack.length < 1) {
          gainNode1.gain.linearRampToValueAtTime(0.30, audioCtx.currentTime + 0.005);
          gainNode2.gain.linearRampToValueAtTime((8 / 127) * 1, audioCtx.currentTime + 0.005)
        }

        noteStack.push(midiData.input);
      } else {
        noteStack = noteStack.filter(note => note !== midiData.input);
        if (noteStack.length < 1) {
          gainNode1.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.005);
          gainNode2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.005);
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
  constructor (audioCtx, frequency = 0.5, gain = 0.04) {
    const oscillator = new OscillatorNode(audioCtx);
    oscillator.type = "sawtooth";

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
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
          gainNode.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.1);
        }

        noteStack.push(midiData.input);
      } else {
        noteStack = noteStack.filter(note => note !== midiData.input);
        if (noteStack.length < 1) {
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
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
  constructor(audioCtx, buffer, gain = 1) {
    this.handleMIDI = (midiData) => {
      if (isKeyDown(midiData)) {
        const source = audioCtx.createBufferSource();
        const gainNode = new GainNode(audioCtx);
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
  constructor (audioCtx) {
    const bufferSize = audioCtx.sampleRate * 5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.handleMIDI = (midiData) => {
      let noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const hpf = new BiquadFilterNode(audioCtx);
      hpf.type = "highpass"
      hpf.frequency.value = 50;

      const lpf = new BiquadFilterNode(audioCtx);
      lpf.type = "lowpass"
      lpf.frequency.value = 50;

      const lfoFilter = new BiquadFilterNode(audioCtx);
      lfoFilter.frequency.value = 3700;
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfo.type = 'sine';
      lfo.frequency.value = 20;
      lfoGain.connect(lfoFilter.frequency);
      lfo.start();

      const gainNode = new GainNode(audioCtx);
      gainNode.gain.value = 0;

      noise.connect(lfoFilter);
      lfoFilter.connect(lpf);
      lpf.connect(hpf);
      hpf.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noise.start();

      if (isKeyDown(midiData)) {
        gainNode.gain.linearRampToValueAtTime(4, audioCtx.currentTime + 0.005);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
        lpf.frequency.linearRampToValueAtTime(1500, audioCtx.currentTime + 0.5);
        hpf.frequency.linearRampToValueAtTime(20000, audioCtx.currentTime + 2);
      }
    }

  }
}

const lead = new Lead(audioCtx);
const bass = new Bass(audioCtx);
const backing1 = new Backing(audioCtx);
const backing2 = new Backing(audioCtx, 0.5, 0.03);
const kick = new Sample(audioCtx, kickBuffer, 0.8);
const clap = new Sample(audioCtx, clapBuffer);
const clap707 = new Sample(audioCtx, clap707Buffer);
const hat = new Sample(audioCtx, hatBuffer);
const hat707 = new Sample(audioCtx, hat707Buffer);
const vocoder = new Sample(audioCtx, vocoderBuffer, 3);
const noise = new Noise(audioCtx);

globalFilter.connect(globalGain);
globalGain.connect(audioCtx.destination);

handleMIDI = (midiData) => {
  if (midiData.input) {
    console.log('MIDI event: ', midiData);
  }

  const midiHandlers = [
    () => {},
    lead.handleMIDI,
    bass.handleMIDI,
    midiData => {
      const { type, input, value } = midiData;
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
