const syllableCounter = (phrase) => {
	phrase = phrase.toLowerCase()
	if (phrase.length <= 3) {
		return 1
	}
	phrase = phrase.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	phrase = phrase.replace(/^y/, '')
	return phrase.match(/[aeiouy]{1,2}/g).length
}

// Audio
const playBanjo = () => {
	const audio = document.getElementById('banjoWav')
	audio.play()
}

// Generating Response HTML
const generateErrorHTML = (error) => (
	'<h2>Error!</h2>' +
	`<p>${error.message}</p>`
)

// Responding to card data
const banjoSpeakAndSet = (text, cardDescriptionEl) => {
	const words = text.split(/\s/)
	let banjoPause = 0
	words.forEach(
		(word) => {
			setTimeout(() => {
				const syl = syllableCounter(word)
				banjoPause = syl * 500
				for (i = 0; i < syl; i++) {
					playBanjo()
				}
				cardDescriptionEl.innerHTML += word
			}, banjoPause)
		}
	)
}

const cardSuccess = (response, cardTitleEl, cardDescEl) => {
	const card = response.data.card
	cardTitleEl.innerHTML = `<h2>${card.name}</h2>`
	banjoSpeakAndSet(card.text, cardDescEl)
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