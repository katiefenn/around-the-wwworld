function midiToFrequency(midi) {
	return 440 * Math.pow(2, (midi - 69) / 12);
}

export default midiToFrequency;
