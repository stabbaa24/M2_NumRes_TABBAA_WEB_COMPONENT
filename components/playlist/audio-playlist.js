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

            const iconSrc = (this.currentIndex === index && !this.audio.paused)
                ? `${getBaseURL() + '../../assets/img/pause.png'}`
                : `${getBaseURL() + '../../assets/img/play.png'}`;

            // Structure de l'élément li avec les colonnes
            li.innerHTML = `
                <span class="track-id">${index + 1}</span>
                <span class="track-name">${music.title}</span>
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

            // Événements de drag-and-drop
            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            li.addEventListener('dragover', (e) => e.preventDefault());
            li.addEventListener('drop', (e) => this.handleDrop(e, index));


        });

        document.querySelectorAll('.track-name').forEach((trackName) => {
            const textSpan = trackName.querySelector('span');
        
            // Vérifiez si le texte déborde du conteneur
            if (textSpan.scrollWidth > trackName.offsetWidth) {
                trackName.classList.add('scrollable');
            } else {
                trackName.classList.remove('scrollable');
            }
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
                console.log('Play/Pause clicked for index:', index);
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

}

customElements.define('audio-playlist', Playlist);