class MIDIAccess {
  constructor(args = {}) {
    this.onDeviceInput = args.onDeviceInput || console.log;
  }

  start() {
    return new Promise((resolve, reject) => {
      this._requestAccess().then(access => {
        this.initialize(access);
        resolve();
      }).catch((e) => reject(`Something went wrong: ${e}`));
    });
  }

  initialize(access) {
    const devices = access.inputs.values();
    for (let device of devices) this.initializeDevice(device);
  }

  initializeDevice(device) {
    if (device.name === 'KeyStep Pro') {
     device.onmidimessage = this.onMessage.bind(this);
    }
  }

  onMessage(message) {
    let [type, input, value] = message.data;
    this.onDeviceInput({ type, input, value });
  }

  _requestAccess() {
    return new Promise((resolve, reject) => {
      if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess()
          .then(resolve)
          .catch(reject);
      else reject();
    });
  }
}

export default MIDIAccess;
