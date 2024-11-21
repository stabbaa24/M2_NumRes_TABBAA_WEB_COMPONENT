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
    <div class="controls">
        <button class="shuffle-btn">🔀 Mode Aléatoire</button>
        <button class="loop-btn">🔂 Jouer en boucle</button>
    </div>
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
            { title: "Je veux y croire - Raiponce", url: "/assets/music/je-veux-y-croire--disney.mp3", duration: null },
            { title: "Hula Diversion - Le Roi Lion", url: "/assets/music/timon-and-pumbas-hula-diversion-french.mp3", duration: null },
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
        this.initResizeObserver();

        // Passer à la chanson suivante automatiquement à la fin de la chanson
        this.audio.addEventListener('ended', () => {
            console.log('Song ended, playing next.');
            this.playNext();
        });
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

            li.classList.toggle('current', index === this.currentIndex);

            const durationText = music.duration
                ? new Date(music.duration * 1000).toISOString().substr(14, 5)
                : '...';

            const iconSrc = (this.currentIndex === index && !this.audio.paused)
                ? `${getBaseURL() + '../../assets/img/pause.png'}`
                : `${getBaseURL() + '../../assets/img/play.png'}`;

            li.innerHTML = `
                <span class="track-id">${index + 1}</span>
                <span class="track-name">
                    <span>${music.title}</span>
                </span>
                <span class="track-duration">${durationText}</span>
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

            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            li.addEventListener('dragover', (e) => e.preventDefault());
            li.addEventListener('drop', (e) => this.handleDrop(e, index));
        });

        // Détecte le débordement et ajoute la classe `scrollable` si nécessaire
        this.shadowRoot.querySelectorAll('.track-name').forEach((trackName) => {
            const textSpan = trackName.querySelector('span');
            if (textSpan.scrollWidth > trackName.offsetWidth) {
                trackName.classList.add('scrollable');
            } else {
                trackName.classList.remove('scrollable');
            }
        });
    }

    attachEventListeners() {
        const trackList = this.shadowRoot.querySelector('.track-list');
        const shuffleButton = this.shadowRoot.querySelector('.shuffle-btn');
        const loopButton = this.shadowRoot.querySelector('.loop-btn');

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

        shuffleButton.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle;
            shuffleButton.textContent = this.isShuffle ? '🔀 Mode Aléatoire : ON' : '🔀 Mode Aléatoire : OFF';
            console.log(`Shuffle mode is now ${this.isShuffle ? 'ON' : 'OFF'}`);
        });

        loopButton.addEventListener('click', () => {
            if (this.loopMode === 'none') {
                this.loopMode = 'one';
                loopButton.textContent = '🔂 Boucle : Une seule chanson';
            } else if (this.loopMode === 'one') {
                this.loopMode = 'all';
                loopButton.textContent = '🔁 Boucle : Toute la playlist';
            } else {
                this.loopMode = 'none';
                loopButton.textContent = '🔂 Boucle : Désactivée';
            }
            console.log(`Loop mode is now: ${this.loopMode}`);
        });
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

        // Récupérer l'élément déplacé
        const [draggedItem] = this.musicList.splice(draggedIndex, 1);

        // Insérer l'élément déplacé à la nouvelle position
        this.musicList.splice(targetIndex, 0, draggedItem);

        // Si la chanson jouée est déplacée, mettez à jour son index
        if (this.currentIndex === draggedIndex) {
            this.currentIndex = targetIndex;
        } else if (this.currentIndex > draggedIndex && this.currentIndex <= targetIndex) {
            // Si une chanson est déplacée devant la chanson en cours, ajustez l'index
            this.currentIndex -= 1;
        } else if (this.currentIndex < draggedIndex && this.currentIndex >= targetIndex) {
            // Si une chanson est déplacée derrière la chanson en cours, ajustez l'index
            this.currentIndex += 1;
        }

        this.renderPlaylist(); // Réafficher la liste
    }

    // Initialisation du ResizeObserver
    initResizeObserver() {
        const observer = new ResizeObserver(() => {
            this.shadowRoot.querySelectorAll('.track-name').forEach((trackName) => {
                const textSpan = trackName.querySelector('span');
                if (textSpan.scrollWidth > trackName.offsetWidth) {
                    trackName.classList.add('scrollable');
                } else {
                    trackName.classList.remove('scrollable');
                }
            });
        });

        // Observez chaque élément .track-name
        this.shadowRoot.querySelectorAll('.track-name').forEach((trackName) => {
            observer.observe(trackName);
        });

        // Sauvegarder l'observer pour un éventuel nettoyage
        this.resizeObserver = observer;
    }

    playNext() {
        if (this.loopMode === 'one') {
            // Rejoue la même chanson
            console.log('Looping the same song.');
            this.audio.currentTime = 0;
            this.audio.play();
        } else if (this.isShuffle) {
            // Mode aléatoire
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.musicList.length);
            } while (nextIndex === this.currentIndex && this.musicList.length > 1);

            console.log(`Shuffle mode: currentIndex=${this.currentIndex}, nextIndex=${nextIndex}`);
            this.currentIndex = nextIndex;
            this.audio.src = this.musicList[nextIndex].url; // Charger la chanson suivante
            this.audio.play();
        } else {
            // Mode normal ou boucle sur toute la playlist
            const nextIndex = (this.currentIndex + 1) % this.musicList.length;
            if (nextIndex === 0 && this.loopMode !== 'all') {
                console.log('End of playlist, stopping playback.');
                this.audio.pause();
                this.currentIndex = null;
            } else {
                console.log(`Normal mode: moving to nextIndex=${nextIndex}`);
                this.currentIndex = nextIndex;
                this.audio.src = this.musicList[nextIndex].url; // Charger la chanson suivante
                this.audio.play();
            }
        }

        this.renderPlaylist(); // Mettre à jour l'affichage
    }

}

customElements.define('audio-playlist', Playlist);