const createPulseOscillator=function(audioCtx) {
    var pulseCurve=new Float32Array(256);
    for(var i=0;i<128;i++) {
        pulseCurve[i]= -1;
        pulseCurve[i+128]=1;
    }
    var constantOneCurve=new Float32Array(2);
    constantOneCurve[0]=1;
    constantOneCurve[1]=1;

    //Use a normal oscillator as the basis of our new oscillator.
    var node=audioCtx.createOscillator();
    node.type="sawtooth";

    //Shape the output into a pulse wave.
    var pulseShaper=audioCtx.createWaveShaper();
    pulseShaper.curve=pulseCurve;
    node.connect(pulseShaper);

    //Use a GainNode as our new "width" audio parameter.
    var widthGain=audioCtx.createGain();
    widthGain.gain.value=0; //Default width.
    node.width=widthGain.gain; //Add parameter to oscillator node.
    widthGain.connect(pulseShaper);

    //Pass a constant value of 1 into the widthGain – so the "width" setting is
    //duplicated to its output.
    var constantOneShaper=audioCtx.createWaveShaper();
    constantOneShaper.curve=constantOneCurve;
    node.connect(constantOneShaper);
    constantOneShaper.connect(widthGain);

    //Override the oscillator's "connect" method so that the new node's output
    //actually comes from the pulseShaper.
    node.connect=function() {
        pulseShaper.connect.apply(pulseShaper, arguments);
        return node;
    }

    //Override the oscillator's "disconnect" method.
    node.disconnect=function() {
        pulseShaper.disconnect.apply(pulseShaper, arguments);
        return node;
    }

    return node;
};

export default createPulseOscillator;
