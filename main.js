const syllableCounter = (word) => {
	word = word.toLowerCase()
	if (word.length <= 3) {
		return ['fallback']
	}
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	word = word.replace(/^y/, '')
	const parsedSyllables = word.match(/[aeiouy]{1,2}/g)
	return parsedSyllables || ['fallback'] 
}

// Audio
const banjoPicker = () => {
	const banjoLo = document.getElementById('banjoLo')
	const banjoMid = document.getElementById('banjoMid')
	const banjoHi = document.getElementById('banjoHi')
	const banjoArray = [
		banjoLo, banjoMid, banjoHi
	]
	return banjoArray[Math.floor(Math.random() * 3)]
}
const playBanjo = (audio) => {
	audio.pause()
	audio.currentTime = 0
	audio.play()
}

const banjoSpeakAndPushSyllable = (word, audio, cardDesc) => {
	for (let i = 0; i < audio.length; i++) {
		setTimeout(() => {
			playBanjo(audio[i])
		}, (i * audio[i].duration * 1000))
	}
	cardDesc.innerHTML += ` ${word}`
}

// Responding to card data
const banjoSpeakAndSet = (text, cardDesc) => {
	const descCon = document.getElementById('descriptionContainer')
	descCon.style = "display: flex;"
	const words = text.split(/\s/)
	let banjoPause = 0
	words.forEach(
		(word) => {
			const syllables = syllableCounter(word)
			const audio = syllables.map(syl => banjoPicker())
			const audioDuration = Math.ceil(audio.reduce(
				(totalTime, audioObj) => totalTime += (audioObj.duration * 1000), 0
			))
			setTimeout(
				() => banjoSpeakAndPushSyllable(word, audio, cardDesc),
				banjoPause
			)
			banjoPause += audioDuration
		}
	)
}

const cardSuccess = (response, cardTitle, cardDesc) => {
	const card = response.data.card
	cardTitle.innerHTML = `<h2>${card.name}</h2>`
	banjoSpeakAndSet(card.text, cardDesc)
}

// Generating Error HTML
const generateErrorHTML = (error) => (
	'<h2>Error!</h2>' +
	`<p>${error.message}</p>`
)

// Getting a card from form
const getCard = () => {
	const cardId = document.getElementById('cardId').value
	const title = document.getElementById('cardTitle')
	const description = document.getElementById('cardDescription')
	const descCon = document.getElementById('descriptionContainer')
	descCon.style.display = "none"
	title.innerHTML = ''
	description.innerHTML = ''

	axios.get(`https://api.magicthegathering.io/v1/cards/${cardId}`)
		.then((response) => (
			cardSuccess(response, title, description)
		))
		.catch((error) => {
			title.innerHTML = generateErrorHTML(error)
			const banjoError = document.getElementById('banjoFail')
			banjoError.pause()
			banjoError.currentTime = 0
			banjoError.play()
		})
}