const API_URL = "https://script.google.com/macros/s/AKfycbzR8xQhsXVK-QhG17-E_8ffvvhTvYWcNyfqfU-xilsKxItcHA5Uwdr4WOq7jQ8Lj8XgJw/exec";

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        document.getElementById("couple").innerText =
            `${data.GroomName} & ${data.BrideName}`;

        document.getElementById("venue").innerText =
            data.Venue;

        document.getElementById("eventDate").innerText =
            data.EventDate;

    })
    .catch(error => {
        console.error(error);
    });