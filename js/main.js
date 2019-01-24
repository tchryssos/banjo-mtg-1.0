const syllableCounter = (phrase) => {
	phrase = phrase.toLowerCase()
	if (phrase.length <= 3) {
		return 1
	}
	phrase = phrase.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
	phrase = phrase.replace(/^y/, '')
	return phrase.match(/[aeiouy]{1,2}/g).length
}

// Generating Response HTML
const generateCardHTML = (card) => (
	`<h2>Card: ${card.name}</h2>` +
	`<p>${card.text}</p>`
)

const generateErrorHTML = (error) => (
	'<h2>Error!</h2>' +
	`<p>${error.message}</p>`
)

// Responding to card data
const cardSuccess = (response, cardDisplayElement) => {
	const card = response.data.card
	cardDisplayElement.innerHTML = generateCardHTML(card)
	const syllableCount = syllableCounter(card.text)
}

// Getting a card from form
const getCard = () => {
	const cardId = document.getElementById('cardId').value
	const resultElement = document.getElementById('cardResponse')
	resultElement.innerHTML = ''

	axios.get(`https://api.magicthegathering.io/v1/cards/${cardId}`)
		.then((response) => (
			cardSuccess(response, resultElement)
		))
		.catch((error) => (
			resultElement.innerHTML = generateErrorHTML(error)
		))
}