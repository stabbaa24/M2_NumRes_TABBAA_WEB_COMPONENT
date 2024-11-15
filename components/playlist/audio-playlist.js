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

        this.musicList = [
            { title: "Ne parlons pas de bruno - La famille Madrigal", url: "/assets/music/bruno.mp3" },
            { title: "Jamais je n'avouerai - Hercules", url: "/assets/music/jamais-je-navouerai--disney.mp3" },
            { title: "Je veux y croire - Raiponce", url: "/assets/music/je-veux-y-croire--disney.mp3" }
        ];

        this.audio = new Audio();
        this.currentIndex = null; // Pour suivre le morceau en cours
    }

    connectedCallback() {
        // Générer la liste des morceaux dans le DOM
        this.renderPlaylist();

        // Attacher les événements de lecture
        this.attachEventListeners();
    }

    renderPlaylist() {
        const trackList = this.shadowRoot.querySelector('.track-list');
        trackList.innerHTML = '';

        this.musicList.forEach((music, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${music.title}</span>
                <button data-index="${index}">
                    <img src="${getBaseURL() + '../../assets/img/play.png'}" alt="Play Icon" />
                </button>
            `;
            trackList.appendChild(li);
        });
    }

    attachEventListeners() {
        const trackList = this.shadowRoot.querySelector('.track-list');
    
        trackList.addEventListener('click', (event) => {
            // Trouver le bouton parent même si l'image a été cliquée
            const button = event.target.closest('button');
            if (button) {
                const index = parseInt(button.getAttribute('data-index'), 10);
                this.playSong(index);
            }
        });
    }

    playSong(index) {
        const trackList = this.shadowRoot.querySelectorAll('button');
        const selectedButton = trackList[index];
    
        if (this.currentIndex === index && !this.audio.paused) {
            // Si le même morceau est déjà en cours, le mettre en pause et changer l'icône
            this.audio.pause();
            selectedButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
        } else {
            // Charger et jouer le nouveau morceau
            const selectedMusic = this.musicList[index];
    
            if (selectedMusic) {
                // Si un autre morceau est en cours on réinitialiser le bouton
                if (this.currentIndex !== null && this.currentIndex !== index) {
                    const previousButton = trackList[this.currentIndex];
                    previousButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
                }
    
                this.currentIndex = index;
                this.audio.src = selectedMusic.url;
                this.audio.play();
    
                // Mettre à jour l'icône pour indiquer "Pause"
                selectedButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/pause.png'}`;
    
                // Émettre un événement personnalisé avec les informations de la chanson sélectionnée
                this.dispatchEvent(new CustomEvent('playSong', {
                    detail: { ...selectedMusic },
                    bubbles: true,
                    composed: true,
                }));
            }
        }
    }
    
}

// Définir le custom element <playlist>
customElements.define('audio-playlist', Playlist);