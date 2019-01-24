const syllableCounter = (word) => {
	word = word.toLowerCase()
	if (word.length <= 3) {
		return 1
	}
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	word = word.replace(/^y/, '')
	const parsedSyl = word.match(/[aeiouy]{1,2}/g)
	return parsedSyl ? parsedSyl.length : 1
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

// Generating Response HTML
const generateErrorHTML = (error) => (
	'<h2>Error!</h2>' +
	`<p>${error.message}</p>`
)

// Responding to card data
const banjoSpeakAndSet = (text, cardDesc) => {
	const words = text.split(/\s/)
	let banjoPause = 1
	let sylCount = 0
	words.forEach(
		(word) => {
			const audio = banjoPicker()
			setTimeout(() => {
				for (i = 0; i < syl; i++) {
					setTimeout(() => {
						playBanjo(audio)
					}, (i * audio.duration * 1000))
				}
				cardDesc.innerHTML += ` ${word}`
			}, banjoPause)

			const syl = syllableCounter(word)
			sylCount += syl
			banjoPause = sylCount * (audio.duration * 1000)
		}
	)
}

const cardSuccess = (response, cardTitle, cardDesc) => {
	const card = response.data.card
	cardTitle.innerHTML = `<h2>${card.name}</h2>`
	banjoSpeakAndSet(card.text, cardDesc)
}

// Getting a card from form
const getCard = () => {
	const cardId = document.getElementById('cardId').value
	const title = document.getElementById('cardTitle')
	const description = document.getElementById('cardDescription')
	title.innerHTML = ''
	description.innerHTML = ''

	axios.get(`https://api.magicthegathering.io/v1/cards/${cardId}`)
		.then((response) => (
			cardSuccess(response, title, description)
		))
		.catch((error) => (
			title.innerHTML = generateErrorHTML(error)
		))
}