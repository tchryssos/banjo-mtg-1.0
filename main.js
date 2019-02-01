// Audio Elements
const loSource = 'assets/banjoLo.wav'
const midSource = 'assets/banjoMid.wav'
const hiSource = 'assets/banjoHi.wav'
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

// Timeouts
const syllableTimeouts = []
const wordTimeouts = []

// Syllable manipulation
const syllableCounter = (word) => {
	word = word.toLowerCase()
	if (word.length <= 3) {
		return ['fff']
	}
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	word = word.replace(/^y/, '')
	const parsedSyllables = word.match(/[aeiouy]{1,2}/g)
	return parsedSyllables || ['fff'] 
}

const syllableWordChunker = (word) => {
	let wordChunkObj = {
		remainingWord: word,
		chunkedWord: [],
	}
	const sylBreaks = syllableCounter(word)
	if (sylBreaks) {
		wordChunkObj = sylBreaks.reduce(
			(accObject, syllableBreak) => {
				const regex = new RegExp(
					'(^[^'+ syllableBreak + ']*' + syllableBreak + ')'
				)
				// This filter removes empty strings created when the regex test
				// splits up a string on the first character
				const split = accObject.remainingWord.split(regex).filter(x => x)
				return {
					remainingWord: split[1],
					chunkedWord: [...accObject.chunkedWord, split[0]]
				}
			}, wordChunkObj
		)
	}
	wordChunkObj.chunkedWord.push(wordChunkObj.remainingWord)
	// This filter removes 'undefined' values created on line 49
	return wordChunkObj.chunkedWord.filter(x => x)
}

// Audio
const samplePicker = () => banjoSampleArray[Math.floor(Math.random() * 3)]

const playAudio = (audio) => {
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
const playSyllablePushWord = (syllables, audio) => {
	for (let i = 0; i < audio.length; i++) {
		syllableTimeouts.push(setTimeout(() => {
			playAudio(audio[i])
			cardDescription.innerHTML += syllables[i]
			if (i === audio.length - 1) {
				cardDescription.innerHTML += ' '
			}
		}, (i * audio[i].duration * 1000)))
	}
}

const banjoSpeakAndSet = (responseCardText) => {
	textBox.style = "display: flex;"
	const words = responseCardText.split(/\s/)
	let banjoPause = 0
	words.forEach(
		(word) => {
			const syllables = syllableWordChunker(word)
			const audioArray = syllables.map(syl => samplePicker())
			let audioDuration
			if (audioArray.every(
				sample => sample.duration
			)) {
				audioDuration = Math.ceil(audioArray.reduce(
					(totalTime, audioObj) => totalTime += (audioObj.duration * 1000), 0
				))
			} else {
				audioDuration = 0
			}
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
	cardTitle.innerHTML = `<h2>${card.name}</h2>`
	banjoSpeakAndSet(card.text || card.flavor)
}

// Getting a card from form
const getCardSetup = () => {
	textBox.style.display = "none"
	cardTitle.innerHTML = ''
	cardDescription.innerHTML = ''
	wordTimeouts.forEach(timeout => clearTimeout(timeout))
	syllableTimeouts.forEach(timeout => clearTimeout(timeout))

	banjoLo.src = loSource
	banjoMid.src = midSource
	banjoHi.src = hiSource
}

const getCard = () => {
	stopAllAudio()
	getCardSetup()
	const cardId = document.getElementById('cardId').value
	cardSuccess({
		data: {
			card: {
				name: 'Good card',
				text: 'Wow what an absolutely spicy card, this one is good to play'
			}
		}
	})
	// axios.get(`https://api.magicthegathering.io/v1/cards/${cardId}`)
	// 	.then((response) => (
	// 		cardSuccess(response)
	// 	))
	// 	.catch((error) => {
	// 		const banjoError = document.getElementById('banjoFail')
	// 		banjoError.pause()
	// 		banjoError.currentTime = 0
	// 		banjoError.play()
	// 		cardTitle.innerHTML = '<h2>Error!</h2>'
	// 		cardDescription.innerHTML = error.message
	// 	})
}