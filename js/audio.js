// Setup
window.AudioContext = (
	() => window.webkitAudioContext || window.AudioContext || window.mozAudioContext
)()

const audioUrl = '../assets/banjo.wav'
let audioContext
try {
	audioContext = new AudioContext
} catch(e) {
	alert('Web Audio API is not supported in this browser')
}
