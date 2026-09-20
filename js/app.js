const API_URL = "https://script.google.com/macros/s/AKfycbzR8xQhsXVK-QhG17-E_8ffvvhTvYWcNyfqfU-xilsKxItcHA5Uwdr4WOq7jQ8Lj8XgJw/exec";

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        document.getElementById("couple").innerText =
            `${data.GroomName} & ${data.BrideName}`;

        document.getElementById("venue").innerText =
            `Venue: ${data.Venue}`;

        document.getElementById("eventDate").innerText =
            `Date: ${data.EventDate}`;

        console.log(data);

    })
    .catch(error => {
        console.error("API Error:", error);

        document.getElementById("couple").innerText =
            "Unable to load data";
    });