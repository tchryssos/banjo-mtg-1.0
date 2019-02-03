// Audio Elements
const loSource = 'assets/BanjoLo.wav'
const midSource = 'assets/BanjoMid.wav'
const hiSource = 'assets/BanjoHi.wav'
const banjoLo = document.getElementById('banjoLo')
const banjoMid = document.getElementById('banjoMid')
const banjoHi = document.getElementById('banjoHi')
const banjoSampleArray = [
	banjoLo, banjoMid, banjoHi,
]

// Display Elements
const cardTitle = document.getElementById('cardTitle')
const cardDescription = document.getElementById('cardDescription')
const textBox = document.getElementById('textBox')
const loadingIcon = document.getElementById('loadingIcon')

// Timeouts
// Timeouts get pushed into one of these two arrays so that we can do a 
// 'clearTimeout' inside a 'forEach' loop, ending all sample triggering.
const syllableTimeouts = []
const wordTimeouts = []

// Syllable manipulation
const syllableBreaker = (word) => {
	word = word.toLowerCase()
	const oneSyl = ['fff']
	if (word.length <= 3) {
		return oneSyl
	}
	// The following lines replace all characters that aren't
	// (commonly) syllable breakpoints with empty strings
	// leaving us with an array of syllable break vowels
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	word = word.replace(/^y/, '')
	// The following line makes sure that of the remaining vowels
	// we chunk on a maximum of two at a time
	const parsedSyllables = word.match(/[aeiouy]{1,2}/g)
	return parsedSyllables || oneSyl
}

const syllableWordChunker = (word) => {
	let wordChunkObj = {
		remainingWord: word,
		chunkedWord: [],
	}
	const sylBreaks = syllableBreaker(word)
	wordChunkObj = sylBreaks.reduce(
		(wordObj, syllableBreak) => {
			// This builds a regex which selects a substring
			// up to and including the first instance of the current syllable break point
			const regex = new RegExp(
				'(^[^'+ syllableBreak + ']*' + syllableBreak + ')'
			)
			let split = []
			// This filter removes empty strings created when the regex test
			// splits up a string on the first character
			if (wordObj.remainingWord) {
				split = wordObj.remainingWord.split(regex).filter(x => x)
			}
			return {
				remainingWord: split[1],
				chunkedWord: [...wordObj.chunkedWord, split[0]]
			}
		}, wordChunkObj
	)
	wordChunkObj.chunkedWord.push(wordChunkObj.remainingWord)
	// This filter removes falsey values pushed on the line above
	return wordChunkObj.chunkedWord.filter(x => x)
}

// Audio
const samplePicker = () => banjoSampleArray[Math.floor(Math.random() * 3)]

const playAudio = (audio) => {
	// This guarantees that we always start a sample from the beginning
	audio.pause()
	audio.currentTime = 0
	audio.play()
}

const stopAllAudio = () => (
	banjoSampleArray.forEach(audio => (
		audio.src=''
	))
)

// Responding to card data
const descriptionOverflow = () => {
	if (cardDescription.offsetHeight < cardDescription.scrollHeight) {
		cardDescription.scrollTop = cardDescription.scrollHeight
	}
}
const playSyllablePushWord = (syllables, audioArray) => {
	for (let i = 0; i < audioArray.length; i++) {
		syllableTimeouts.push(setTimeout(() => {
			playAudio(audioArray[i])
			cardDescription.innerHTML += syllables[i]
			// add a space if this is the last time through the loop
			// aka the end of the word
			if (i === audioArray.length - 1) {
				cardDescription.innerHTML += ' '
			}
			descriptionOverflow()
		}, (i * audioArray[i].duration * 1000)))
	}
}

const banjoSpeakAndSet = (responseCardText) => {
	textBox.style = "display: flex;"
	const words = responseCardText.split(/\s/)
	let banjoPause = 0
	words.forEach(
		(word) => {
			/*
				1) Get an array of the given word's syllable break points
				2) Get an array consisting of one audio sample per syllable
				3) Add the durations of these audio samples together.
					(The durations are in seconds, so convert to milliseconds)
				4) Create a timeout function that plays audio samples and writes the words to the page.
					This is delayed by the current total audio duration of all samples for all words preceeding,
					so that each word is added and played in order.
					Push this timeout into the appropriate timeout array.
				5) Update the timeout timer for the next iteration with this word's audio duration.
			*/
			const syllables = syllableWordChunker(word)
			const audioArray = syllables.map(syl => samplePicker())
			const audioDuration = Math.ceil(audioArray.reduce(
					(totalTime, audioObj) => totalTime += (audioObj.duration * 1000), 0
				))
			wordTimeouts.push(setTimeout(
				() => playSyllablePushWord(syllables, audioArray),
				banjoPause
			))
			banjoPause += audioDuration
		}
	)
}

const cardSuccess = (response) => {
	const card = response.data.card
	loadingIcon.style.display = "none"
	cardTitle.innerHTML = `<h2>${card.name}</h2>`
	// Some cards don't have rule text, so use flavor text instead.
	banjoSpeakAndSet(card.text || card.flavor)
}

// Getting a card from form
const getCardSetup = () => {
	textBox.style.display = "none"
	loadingIcon.style.display = "block"
	cardTitle.innerHTML = ''
	cardDescription.innerHTML = ''
	// Because all of our timeouts are in arrays
	// we can loop over them to stop all sample playback and word printing.
	wordTimeouts.forEach(timeout => clearTimeout(timeout))
	syllableTimeouts.forEach(timeout => clearTimeout(timeout))

	// Because of an Audio API quirk, the best way to stop all audio is to
	// remove the audio source. We reset these sources on setup.
	banjoLo.src = loSource
	banjoMid.src = midSource
	banjoHi.src = hiSource
}

const getCard = () => {
	stopAllAudio()
	getCardSetup()
	const cardId = document.getElementById('cardId').value
	axios.get(`https://api.magicthegathering.io/v1/cards/${cardId}`)
		.then((response) => (
			cardSuccess(response)
		))
		.catch((error) => {
			const banjoError = document.getElementById('banjoFail')
			loadingIcon.style.display = "none"
			playAudio(banjoError)
			cardTitle.innerHTML = '<h2>Error!</h2>'
			textBox.style = "display: flex;"
			cardDescription.innerHTML = error.message
		})
}