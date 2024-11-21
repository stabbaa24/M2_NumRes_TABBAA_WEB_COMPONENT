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

// Ajout des fonctionnalités demandées
class Playlist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Liste des morceaux
        this.musicList = [
            { title: "Ne parlons pas de bruno - La famille Madrigal", url: "/assets/music/bruno.mp3", duration: null },
            { title: "Jamais je n'avouerai - Hercules", url: "/assets/music/jamais-je-navouerai--disney.mp3", duration: null },
            { title: "Je veux y croire - Raiponce", url: "/assets/music/je-veux-y-croire--disney.mp3", duration: null }
        ];

        this.audio = new Audio();
        this.currentIndex = null;
        this.isShuffle = false;
        this.loopMode = 'all'; // 'all', 'one', or 'none'
    }

    connectedCallback() {
        this.loadDurations();
        this.renderPlaylist();
        this.attachEventListeners();
    }

    loadDurations() {
        this.musicList.forEach((music, index) => {
            const tempAudio = new Audio(music.url);
            tempAudio.addEventListener('loadedmetadata', () => {
                this.musicList[index].duration = tempAudio.duration;
                this.renderPlaylist();
            });
        });
    }

    renderPlaylist() {
        const trackList = this.shadowRoot.querySelector('.track-list');
        trackList.innerHTML = '';

        this.musicList.forEach((music, index) => {
            const li = document.createElement('li');
            li.setAttribute('draggable', true);
            li.dataset.index = index;

            // Ajouter une classe "current" pour mettre en évidence la chanson en cours
            li.classList.toggle('current', index === this.currentIndex);

            const durationText = music.duration
                ? new Date(music.duration * 1000).toISOString().substr(14, 5)
                : '...';

            // Sélection de l'icône en fonction de l'état de la chanson
            const iconSrc = (this.currentIndex === index && !this.audio.paused)
                ? `${getBaseURL() + '../../assets/img/pause.png'}` // Icône pause si la chanson est en cours de lecture
                : `${getBaseURL() + '../../assets/img/play.png'}`; // Icône play sinon

            li.innerHTML = `
                <span>${music.title}</span>
                <span>${durationText}</span>
                <div class="button-group">
                    <button class="play-pause" data-index="${index}" aria-label="Play">
                        <img src="${iconSrc}" alt="Play Icon" />
                    </button>
                    <button class="reload" data-index="${index}" aria-label="Reload">
                        <img src="${getBaseURL() + '../../assets/img/reload.png'}" alt="Reload Icon" />
                    </button>
                    <button class="delete" data-index="${index}" aria-label="Delete">
                        ❌
                    </button>
                </div>
            `;
            trackList.appendChild(li);

            // Événements de drag-and-drop
            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            li.addEventListener('dragover', (e) => e.preventDefault());
            li.addEventListener('drop', (e) => this.handleDrop(e, index));
        });
    }

    attachEventListeners() {
        const trackList = this.shadowRoot.querySelector('.track-list');

        trackList.addEventListener('click', (event) => {
            const playPauseButton = event.target.closest('.play-pause');
            const reloadButton = event.target.closest('.reload');
            const deleteButton = event.target.closest('.delete');

            if (playPauseButton) {
                const index = parseInt(playPauseButton.getAttribute('data-index'), 10);
                this.playPauseSong(index);
            }

            if (reloadButton) {
                const index = parseInt(reloadButton.getAttribute('data-index'), 10);
                this.reloadSong(index);
            }

            if (deleteButton) {
                const index = parseInt(deleteButton.getAttribute('data-index'), 10);
                this.deleteSong(index);
            }
        });

        // Boutons de contrôle
        const shuffleButton = this.shadowRoot.querySelector('.shuffle');
        const loopButton = this.shadowRoot.querySelector('.loop');

        if (shuffleButton) {
            shuffleButton.addEventListener('click', () => {
                this.isShuffle = !this.isShuffle;
                shuffleButton.textContent = this.isShuffle ? '🔀 On' : '🔀 Off';
            });
        }

        if (loopButton) {
            loopButton.addEventListener('click', () => {
                this.loopMode = this.loopMode === 'all' ? 'one' : this.loopMode === 'one' ? 'none' : 'all';
                loopButton.textContent = this.loopMode === 'all' ? '🔁 All' : this.loopMode === 'one' ? '🔂 One' : '➡';
            });
        }
    }

    playPauseSong(index) {
        const trackList = this.shadowRoot.querySelectorAll('.play-pause');
    
        if (this.currentIndex === index) {
            if (this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        } else {
            if (this.currentIndex !== null) {
                const previousButton = trackList[this.currentIndex];
                previousButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
            }
    
            this.currentIndex = index;
            const selectedMusic = this.musicList[index];
            if (selectedMusic) {
                this.audio.src = selectedMusic.url;
                this.audio.play();
            }
        }

        // Émettre l'événement `playSong` pour signaler une lecture
    this.dispatchEvent(new CustomEvent('playSong', {
        detail: { index },
        bubbles: true,
        composed: true,
    }));

    console.log(`Event playSong dispatched for index: ${index}`); // Ajoutez un log pour valider
    
        this.renderPlaylist(); // Mise à jour de l'affichage
    }
    
    reloadSong(index) {
        const selectedMusic = this.musicList[index];
        this.audio.src = selectedMusic.url;
        this.audio.currentTime = 0;
        this.audio.play();
        this.currentIndex = index;
        this.renderPlaylist();
    }

    deleteSong(index) {
        this.musicList.splice(index, 1);
        if (this.currentIndex === index) {
            this.audio.pause();
            this.currentIndex = null;
        }
        this.renderPlaylist();
    }

    handleDragStart(event, index) {
        event.dataTransfer.setData('text/plain', index);
    }

    handleDrop(event, targetIndex) {
        const draggedIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
        const [draggedItem] = this.musicList.splice(draggedIndex, 1);
        this.musicList.splice(targetIndex, 0, draggedItem);
        this.renderPlaylist();
    }
}

customElements.define('audio-playlist', Playlist);