const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour la playlist
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-playlist.css'}">
    <h3>Playlist</h3>
    <ul class="track-list"></ul>
`;

class Playlist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Liste des morceaux
        this.musicList = [
            { title: "Ne parlons pas de bruno - La famille Madrigal", url: "/assets/music/bruno.mp3" },
            { title: "Jamais je n'avouerai - Hercules", url: "/assets/music/jamais-je-navouerai--disney.mp3" },
            { title: "Je veux y croire - Raiponce", url: "/assets/music/je-veux-y-croire--disney.mp3" }
        ];

        this.audio = new Audio();
        this.currentIndex = null; // Pour suivre le morceau en cours
    }

    // Fonction appelée lorsque le composant est ajouté au DOM
    connectedCallback() {
        // Générer la liste des morceaux dans le DOM
        this.renderPlaylist();

        // Attacher les événements de lecture
        this.attachEventListeners();

        // Écouter la fin de la musique
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });
    }

    // Fonction pour générer la liste des morceaux
    renderPlaylist() {
        const trackList = this.shadowRoot.querySelector('.track-list');
        trackList.innerHTML = '';

        this.musicList.forEach((music, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${music.title}</span>
                <button class="play-pause" data-index="${index}" aria-label="Play">
                    <img src="${getBaseURL() + '../../assets/img/play.png'}" alt="Play Icon" />
                </button>
                <button class="reload" data-index="${index}" aria-label="Reload">
                    <img src="${getBaseURL() + '../../assets/img/reload.png'}" alt="Reload Icon" />
                </button>
            `;
            trackList.appendChild(li);
        });
    }

    // Fonction pour attacher les événements de lecture et de reload
    attachEventListeners() {
        const trackList = this.shadowRoot.querySelector('.track-list');

        trackList.addEventListener('click', (event) => {
            const playPauseButton = event.target.closest('.play-pause');
            const reloadButton = event.target.closest('.reload');

            if (playPauseButton) {
                const index = parseInt(playPauseButton.getAttribute('data-index'), 10);
                this.playPauseSong(index);
            }

            if (reloadButton) {
                const index = parseInt(reloadButton.getAttribute('data-index'), 10);
                this.reloadSong(index);
            }
        });
    }

    // Fonction pour jouer ou mettre en pause un morceau
    playPauseSong(index) {
        const trackList = this.shadowRoot.querySelectorAll('.play-pause');
        const selectedButton = trackList[index];

        if (this.currentIndex === index && !this.audio.paused) {
            this.audio.pause();
            selectedButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
        } else {
            const selectedMusic = this.musicList[index];

            if (selectedMusic) {
                if (this.currentIndex !== null && this.currentIndex !== index) {
                    const previousButton = trackList[this.currentIndex];
                    previousButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
                }

                this.currentIndex = index;
                this.audio.src = selectedMusic.url;
                this.audio.play();
                selectedButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/pause.png'}`;

                this.dispatchEvent(new CustomEvent('playSong', {
                    detail: { ...selectedMusic },
                    bubbles: true,
                    composed: true,
                }));
            }
        }
    }

    // Fonction pour relancer un morceau
    reloadSong(index) {
        const selectedMusic = this.musicList[index];
        if (selectedMusic) {
            this.audio.src = selectedMusic.url;
            this.audio.currentTime = 0;
            this.audio.play();

            const playPauseButton = this.shadowRoot.querySelector(`.play-pause[data-index="${index}"]`);
            if (playPauseButton) {
                playPauseButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/pause.png'}`;
            }

            this.dispatchEvent(new CustomEvent('reloadSong', {
                detail: { ...selectedMusic },
                bubbles: true,
                composed: true,
            }));
        }
    }

    // Fonction pour jouer le morceau suivant
    playNext() {
        const nextIndex = (this.currentIndex + 1) % this.musicList.length; // Passe au prochain morceau, revient au début si à la fin
        this.playPauseSong(nextIndex);
    }
}

// Définir le custom element <playlist>
customElements.define('audio-playlist', Playlist);