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


		document.getElementById("eventDateDetail").innerText =
			data.EventDate;

		document.getElementById("eventTime").innerText =
			data.EventTime;

		document.getElementById("eventVenue").innerText =
			data.Venue;

		document.getElementById("mapsButton").href =
			data.MapsLink;
			
const eventDate = new Date(data.EventDate);

	document.getElementById("eventDate").innerText =
		eventDate.toLocaleDateString(
			"en-GB",
			{
				day: "numeric",
				month: "long",
				year: "numeric"
			}
		);
	
const formattedDate =
    new Date(data.EventDate)
    .toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

	document.getElementById("eventDate").innerText =
		formattedDate;

	document.getElementById("eventDateDetail").innerText =
		formattedDate;	

    })
    .catch(error => {
        console.error(error);
    });