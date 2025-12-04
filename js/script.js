let currentSong = new Audio();
let songs = [];

// Fetch all songs from a given folder
async function getSongs(folder = "") {
    let list = [];

    async function fetchFrom(path) {
        let a = await fetch(path);
        let response = await a.text();

        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");

        for (let index = 0; index < as.length; index++) {
            let element = as[index];

            if (element.href.endsWith(".mp3")) {
                let clean = element.href.replaceAll("%5C", "/");
                let fileName = clean.split("/").pop();

                list.push({
                    name: fileName,          
                    path: folder + fileName  
                });
            }
        }
    }

    await fetchFrom(`songs/${folder}`);
    return list;
}


function playMusic(track, pause = false) {
    currentSong.src = `songs/${track}`;

    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "src/pause.svg";
        document.querySelector(".songTime").style.color = "#78b88f";
        document.querySelector(".songInfo").style.color = "#78b88f";
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track.split("/").pop());
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

// Load and display folder songs
async function loadSongs(folderName) {
    songs = await getSongs(folderName);

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; 

    let covers = ["p1.jpeg", "p2.jpeg", "p3.jpeg", "p4.jpeg", "p5.jpeg", "p6.jpeg"];

    let coverList = [];
    for (let i = 0; i < songs.length; i++) {
        coverList.push(covers[i % covers.length]);
    }

    songs.forEach((song, index) => {
        let coverImage = coverList[index];

        songUL.innerHTML += `
            <li>
                <img width="55px" height="55px" class="cover" src="src/cover/${coverImage}" alt="cover">
                <div class="info">
                    <div>${song.name}</div>
                    <div>Dhwani</div>
                </div>
                <img class="invert" src="src/play.svg" alt="play song">
            </li>`;
    });

    Array.from(songUL.children).forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index].path);
        });
    });
}



async function main() {

    document.querySelectorAll(".card").forEach((c, index) => {
        c.addEventListener("click", () => {
            if (index === 0) {
                loadSongs("happy/");
            } else if (index === 1) {
                loadSongs("sad/");
            }
        });
    });

    // PLAY / PAUSE BUTTON
    let play = document.querySelector("#play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "src/pause.svg";
            document.querySelector(".songInfo").style.color = "#78b88f";
            document.querySelector(".songTime").style.color = "#78b88f";
        } else {
            currentSong.pause();
            play.src = "src/play.svg";
            document.querySelector(".songInfo").style.color = "white";
            document.querySelector(".songTime").style.color = "white";
        }
    });

    // PREVIOUS & NEXT
    let prev = document.querySelector("#prev");
    let next = document.querySelector("#next");

    prev.addEventListener("click", () => {
        let currentName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.findIndex(s => s.name === currentName);

        if (index > 0) {
            playMusic(songs[index - 1].path);
        }
    });

    next.addEventListener("click", () => {
        let currentName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.findIndex(s => s.name === currentName);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1].path);
        }
    });

    // Convert seconds → mm:ss
    function secondsToMinutesSeconds(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
        if (m < 10) m = "0" + m;
        if (s < 10) s = "0" + s;
        return `${m}:${s}`;
    }

    // Update song time + seekbar
    currentSong.addEventListener("timeupdate", () => {
        let current = secondsToMinutesSeconds(currentSong.currentTime);
        let total = secondsToMinutesSeconds(currentSong.duration);

        document.querySelector(".songTime").innerHTML = `${current} / ${total}`;
        document.querySelector(".circle").style.left =
            `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Seekbar mouse click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".logo1").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Volume control
    document.getElementById("volumeRange").addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    //search 
const searchLi = document.querySelector(".search");
const songListContainer = document.querySelector(".songList");

searchLi.addEventListener("click", () => {
    if (!document.getElementById("songSearch")) {
        searchLi.style.display = "none";

        // Create input
        const input = document.createElement("input");
        input.type = "text";
        input.id = "songSearch";
        input.placeholder = "Search songs...";
        input.className = "searchInput";
        input.style.width = "100%";
        input.style.padding = "5px";
        input.style.marginBottom = "10px";
        input.style.borderRadius = "5px";
        input.style.border = "1px solid #ccc";

        songListContainer.prepend(input);
        input.focus();

        input.addEventListener("input", () => {
            const query = input.value.toLowerCase();
            const songUL = document.querySelector(".songList ul");

            Array.from(songUL.children).forEach((li, index) => {
                const songName = songs[index].name.toLowerCase();
                li.style.display = songName.includes(query) ? "flex" : "none";
            });
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                input.remove();
                searchLi.style.display = "flex";
            }
        });
    }
});

}

main();
