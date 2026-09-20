const API_URL = "https://script.google.com/macros/s/AKfycbzR8xQhsXVK-QhG17-E_8ffvvhTvYWcNyfqfU-xilsKxItcHA5Uwdr4WOq7jQ8Lj8XgJw/exec";

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        document.getElementById("welcome").innerText =
            data.WelcomeText;

        document.getElementById("couple").innerText =
            `${data.GroomName} & ${data.BrideName}`;

        document.getElementById("eventDate").innerText =
            data.EventDate;

        document.getElementById("venue").innerText =
            data.Venue;
			
const targetTime = new Date(data.CountdownDate).getTime();

	let serverTime = new Date(data.ServerTime).getTime();

	function updateCountdown() {

		const diff = targetTime - serverTime;

		const days =
			Math.floor(diff / (1000 * 60 * 60 * 24));

		const hours =
			Math.floor(
				(diff % (1000 * 60 * 60 * 24))
				/ (1000 * 60 * 60)
			);

		const minutes =
			Math.floor(
				(diff % (1000 * 60 * 60))
				/ (1000 * 60)
			);

		const seconds =
			Math.floor(
				(diff % (1000 * 60))
				/ 1000
			);

		document.getElementById("countdown").innerText = `${days} Hari ${hours} Jam ${minutes} Minit ${seconds} Saat`;

		serverTime += 1000;
	}

	updateCountdown();

	setInterval(updateCountdown, 1000);

    })
    .catch(error => {
        console.error(error);
    });