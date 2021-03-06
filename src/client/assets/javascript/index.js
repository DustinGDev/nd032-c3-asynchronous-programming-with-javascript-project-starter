// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	getTracks()
		.then(tracks => {
			const html = renderTrackCards(tracks)
			renderAt('#tracks', html)
		})

	getRacers()
		.then((racers) => {
			const html = renderRacerCars(racers)
			renderAt('#racers', html)
		})
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		const targetLi = target.parentNode;
		// Race track form field
		if (targetLi.matches('.card.track')) {
			handleSelectTrack(targetLi)
		}

		// Podracer form field
		if (targetLi.matches('.card.podracer')) {
			handleSelectPodRacer(targetLi)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	return await new Promise(resolve => setTimeout(resolve, ms));
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race
async function handleCreateRace() {
	// render starting UI
	// TODO - Get player_id and track_id from the store
	const { player_id, track_id } = store;
	const race = await createRace(player_id, track_id);
	
	renderAt('#race', renderRaceStartView(race.Track))
	// TODO - update the store with the race id
	store.race_id = race.ID-1 // Race ID not send back properly?
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown();
	// TODO - call the async function startRace
	startRace(store.race_id);

	// TODO - call the async function runRace
	runRace(store.race_id);
}

async function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {
			const raceInfo = await getRace(raceID);
			if (raceInfo.status === 'in-progress') {
				renderAt('#leaderBoard', raceProgress(raceInfo.positions))
			} else if (raceInfo.status === 'finished') {
				clearInterval(raceInterval) // to stop the interval from repeating
				renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
				resolve(raceInfo) // resolve the promise
			}
		}, 500)
	/* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
	*/

	/* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
	})
}

async function runCountdown() {
	// wait for the DOM to load
	await delay(1000)
	let timer = 3

	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to count down once per second

		// run this DOM manipulation to decrement the countdown for the user

		const interval = setInterval(() => {
			document.getElementById('big-numbers').innerHTML = --timer

			if (!timer) {
				clearInterval(interval);
				resolve();
			}
		}, 1000)

		// TODO - if the countdown is done, clear the interval, resolve the promise, and return

	})
}

function handleSelectPodRacer(target) {

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = target.id
}

function handleSelectTrack(target) {

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id;
	
}

function handleAccelerate() {
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === Number(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call to each of the following API endpoints

function getTracks() {
	return fetch(`${SERVER}/api/tracks`).then(res=>res.json());
}

function getRacers() {
	return fetch(`${SERVER}/api/cars`).then(res=>res.json());
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		...defaultFetchOpts(),
		method: 'POST',
		dataType: 'jsonp',
		body: JSON.stringify(body)
	}).then(res => res.json())
}

function getRace(id) {
	return fetch(`${SERVER}/api/races/${id}`).then(res=>res.json());
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		...defaultFetchOpts(),
		method: 'POST',
		mode: 'cors',
	})
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body, datatype, or cors needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		...defaultFetchOpts(),
		method: 'POST',
		mode: 'cors',
	})
}
