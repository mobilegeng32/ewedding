const API_URL = "https://script.google.com/macros/s/AKfycbzR8xQhsXVK-QhG17-E_8ffvvhTvYWcNyfqfU-xilsKxItcHA5Uwdr4WOq7jQ8Lj8XgJw/exec";

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        document.getElementById("welcome").innerText =
            data.WelcomeText;

        document.getElementById("couple").innerText =
            `${data.GroomName} & ${data.BrideName}`;

        const parts = data.EventDate.split("/");

        const bulan = [
            "Januari",
            "Februari",
            "Mac",
            "April",
            "Mei",
            "Jun",
            "Julai",
            "Ogos",
            "September",
            "Oktober",
            "November",
            "Disember"
        ];

        const formattedDate =
            `${parts[0]} ${bulan[parseInt(parts[1]) - 1]} ${parts[2]}`;

        document.getElementById("eventDate").innerText =
            formattedDate;

        document.getElementById("venue").innerText =
            data.Venue;

        const targetTime =
            new Date(data.CountdownDate).getTime();

        let serverTime =
            new Date(data.ServerTime).getTime();

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

            document.getElementById("countdown").innerText =
                `${days} Hari ${hours} Jam ${minutes} Minit ${seconds} Saat`;

            serverTime += 1000;

        }

        updateCountdown();

        setInterval(updateCountdown, 1000);

        document.getElementById("eventDateDetail").innerText =
            formattedDate;

        document.getElementById("eventTime").innerText =
            data.EventTime;

        document.getElementById("eventVenue").innerText =
            data.Venue;

        document.getElementById("mapsButton").href =
            data.MapsLink;

    })
    .catch(error => {
        console.error(error);
    });

fetch(API_URL + "?action=story")
    .then(response => response.json())
    .then(stories => {

        const container =
            document.getElementById("story-container");

        container.innerHTML = "";

        stories.forEach((story, index) => {

            container.innerHTML += `
                <div class="timeline-item">
                    <div class="timeline-year">${story.year}</div>
                    <div class="timeline-center collapsed">
                        <div class="timeline-dot"></div>
                    </div>
                    <div class="timeline-content">
                        <div class="story-header" onclick="toggleStory(${index})">
                            <div class="story-year">${story.title}</div>
                            <div class="story-arrow" id="arrow-${index}">▼</div>
                        </div>

                        <div class="story-body" id="story-${index}">
                            <div class="story-description">${story.description}</div>
                            <img src="${story.imageUrl}" alt="${story.title}" class="story-image">
                        </div>
                    </div>
                </div>`;

        });

    })
    .catch(error => {
        console.error(error);
    });

function toggleStory(index) {

    const allBodies =
        document.querySelectorAll(".story-body");

    const allArrows =
        document.querySelectorAll(".story-arrow");

    const currentBody =
        document.getElementById(`story-${index}`);

    const currentArrow =
        document.getElementById(`arrow-${index}`);

    const isOpen =
        currentBody.classList.contains("open");

    allBodies.forEach(body => {
        body.classList.remove("open");
    });

    allArrows.forEach(arrow => {
        arrow.innerHTML = "▼";
    });

    if (!isOpen) {

        currentBody.classList.add("open");

        currentArrow.innerHTML = "▲";

    }

}