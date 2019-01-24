// Audio setup
window.AudioContext = (
	() => window.webkitAudioContext || window.AudioContext || window.mozAudioContext
)()

const audioUrl = 'assets/banjo.wav'
let analyzerNode
let audioContext
let audioData = null
let javascriptNode
const sampleSize = 1024
let sourceNode

try {
	audioContext = new AudioContext
} catch(e) {
	alert('Web Audio API is not supported in this browser')
}

// Audio player setup
const setUpNodes = () => {
	sourceNode = audioContext.createBufferSource()
	analyserNode = audioContext.createAnalyser()
	javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1)
	amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount)
	sourceNode.connect(audioContext.destination)
	sourceNode.connect(analyserNode)
	analyserNode.connect(javascriptNode)
}

const audioError = (e) => console.log(e)

const loadAudio = (url) => {
	const request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.responseType = 'arraybuffer'
	request.onload = () => {
		audioContext.decodeAudioData(request.response, (buffer) => {
			audioData = buffer
			playAudio(audioData)
		}, audioError)
	}
	request.send()
}

const playAudio = (buffer) => {
	sourceNode.buffer = buffer
	sourceNode.start(0)
}

// On card response recieved
const playBanjo = () => {
	setUpNodes()
	if(audioData == null) {
		loadAudio(audioUrl)
	} else {
		playAudio(audioData)
	}
}