const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

const musicList = [
    {
        "title": "A New World Awaits  Assassins Creed Mirage (Original Game Soundtrack)  Brendan Angelides",
        "url": `${getBaseURL()}../../assets/music/A New World Awaits  Assassins Creed Mirage (Original Game Soundtrack)  Brendan Angelides.mp3`
    },
    {
        "title": "Blood Sweat & Tears (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Blood Sweat & Tears (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Cocktail Molotov (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Cocktail Molotov (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Come Play (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Come Play (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Dirty Little Animals (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Dirty Little Animals (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Dynasties and Dystopia (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Dynasties and Dystopia (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Enemy (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Enemy (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Fantastic (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Fantastic (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Goodbye (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Goodbye (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Guns for Hire (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Guns for Hire (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Heavy Is The Crown (Original Score)",
        "url": `${getBaseURL()}../../assets/music/Heavy Is The Crown (Original Score).mp3`
    },
    {
        "title": "Hellfire (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Hellfire (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "I Cant Hear It Now (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/I Cant Hear It Now (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Ma Meilleure Ennemie (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Ma Meilleure Ennemie (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Misfit Toys (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Misfit Toys (from the series Arcane League of Legends).mp3`
    }
    ,
    {
        "title": "Our Love (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Our Love (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Paint The Town Blue (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Paint The Town Blue (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Playground (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Playground (from the series Arcane League of Legends).mp3`
    }
    ,
    {
        "title": "Rebel Heart (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Rebel Heart (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Renegade (We Never Run)",
        "url": `${getBaseURL()}../../assets/music/Renegade (We Never Run).mp3`
    },
    {
        "title": "Snakes (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Snakes (from the series Arcane League of Legends).mp3`
    }
    ,
    {
        "title": "Spin The Wheel (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../ssets/music/Spin The Wheel (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Sucker (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Sucker (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "The Beast (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/The Beast (from the series Arcane League of Legends).mp3`
    }
    ,
    {
        "title": "The Line (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/The Line (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "To Ashes and Blood (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/To Ashes and Blood (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "Wasteland (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/Wasteland (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "What Could Have Been (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/What Could Have Been (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "What Have They Done To Us (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/What Have They Done To Us (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "When Everything Went Wrong (from the series Arcane League of Legends)",
        "url": `${getBaseURL()}../../assets/music/When Everything Went Wrong (from the series Arcane League of Legends).mp3`
    },
    {
        "title": "这样很好 (Ishas Song)",
        "url": `${getBaseURL()}../../assets/music/这样很好 (Ishas Song).mp3`
    }
];

// Template HTML pour la playlist
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-playlist.css'}">
    <h3>Playlist</h3>
    <ul class="track-list"></ul>
    <div class="progress-container">
    <div>
        <button class="seek-backward" aria-label="Reculer de 15 secondes">-15s</button>
        <input type="range" class="progress-slider" min="0" max="100" value="0" step="1">
        <button class="seek-forward" aria-label="Avancer de 15 secondes">+15s</button>
    </div>
    <div class="time-display">
        <span class="current-time">0:00</span> <span class="total-time">0:00</span>
    </div>
</div>

    <div class="controls">
        <div class="add-music">
            <input type="file" class="upload-music" accept="audio/*" />
            <button class="add-to-playlist">Ajouter à la playlist</button>
        </div>
        <button class="shuffle-btn">
            <img src="${getBaseURL()}../../assets/img/btnrdm_bleu.png" alt="Mode Aléatoire" />
            <span>Mode Normal</span>
        </button>
        <button class="loop-btn">
            <img src="${getBaseURL()}../../assets/img/btnrepeat_bleu.png" alt="Jouer en boucle" />
            <span>Type d\'écoute</span>
        </button>
    </div>
`;

// Ajout des fonctionnalités demandées
class Playlist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audio = new Audio(); // Créer un élément audio
        this.musicList = musicList;
        this.currentIndex = null; // Index de la chanson en cours de lecture
        this.isShuffle = false; // Mode aléatoire
        this.loopMode = 'none'; // 'all', 'one', or 'none'
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    async connectedCallback() {
        try {
            await this.loadDurations();
            this.renderPlaylist();
            this.attachEventListeners();
            this.initResizeObserver();

            this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
            this.audio.addEventListener('loadedmetadata', this.updateTotalTime.bind(this));

            this.audio.addEventListener('ended', () => {
                console.log('Song ended, playing next.');
                this.playNext();
            });
        } catch (error) {
            console.error('Error in connectedCallback:', error);
        }
    }

    async loadDurations() {
        for (const [index, music] of this.musicList.entries()) {
            try {
                const tempAudio = new Audio(music.url);
                await new Promise((resolve, reject) => {
                    tempAudio.addEventListener('loadedmetadata', () => {
                        this.musicList[index].duration = tempAudio.duration;
                        resolve();
                    });
                    tempAudio.addEventListener('error', (err) => {
                        console.warn(`Failed to load metadata for: ${music.title}`, err);
                        this.musicList[index].duration = null;
                        resolve();
                    });
                });
            } catch (error) {
                console.error(`Error loading metadata for: ${music.title}`, error);
            }
        }
        this.renderPlaylist();
    }

    // Fonction pour afficher la playlist
    renderPlaylist() {
        const trackList = this.shadowRoot.querySelector('.track-list'); // Récupérer la liste des morceaux
        trackList.innerHTML = ''; // Réinitialiser la liste

        this.musicList.forEach((music, index) => {
            const li = document.createElement('li'); // Créer un nouvel élément li
            li.setAttribute('draggable', true); // Activer le drag-and-drop
            li.dataset.index = index; // Stocker l'index de la chanson

            li.classList.toggle('current', index === this.currentIndex); // Ajouter la classe 'current' si c'est la chanson en cours

            // Mettre à jour l'affichage de la durée
            const durationText = music.duration
                ? new Date(music.duration * 1000).toISOString().substr(14, 5)
                : '...';

            // Mettre à jour l'icône de lecture/pause
            const iconSrc = (this.currentIndex === index && !this.audio.paused)
                ? `${getBaseURL() + '../../assets/img/pause.png'}`
                : `${getBaseURL() + '../../assets/img/play.png'}`;

            // Mettre à jour l'affichage
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

            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index)); // Gérer le drag-and-drop
            li.addEventListener('dragover', (e) => e.preventDefault()); // Empêcher le comportement par défaut
            li.addEventListener('drop', (e) => this.handleDrop(e, index)); // Gérer le drop
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

    // Fonction pour attacher les écouteurs d'événements
    attachEventListeners() {
        const trackList = this.shadowRoot.querySelector('.track-list'); // Récupérer la liste des morceaux 
        const shuffleButton = this.shadowRoot.querySelector('.shuffle-btn'); // Récupérer le bouton de mode aléatoire
        const loopButton = this.shadowRoot.querySelector('.loop-btn'); // Récupérer le bouton de boucle
        const addButton = this.shadowRoot.querySelector('.add-to-playlist'); // Récupérer le bouton d'ajout de musique
        const uploadInput = this.shadowRoot.querySelector('.upload-music'); // Récupérer l'input de téléchargement
        const progressSlider = this.shadowRoot.querySelector('.progress-slider');
        const seekBackwardButton = this.shadowRoot.querySelector('.seek-backward');
        const seekForwardButton = this.shadowRoot.querySelector('.seek-forward');

        // Gestion du bouton d'ajout de musique à la playlist
        addButton.addEventListener('click', () => {
            if (uploadInput.files.length > 0) {
                const file = uploadInput.files[0];
                const objectURL = URL.createObjectURL(file);

                this.musicList.push({
                    title: file.name,
                    url: objectURL,
                    duration: null,
                });

                this.loadDurations();
                console.log(`Added ${file.name} to the playlist.`);
            }
        });

        // Gérer les clics sur les boutons
        trackList.addEventListener('click', (event) => {
            const playPauseButton = event.target.closest('.play-pause');
            const reloadButton = event.target.closest('.reload');
            const deleteButton = event.target.closest('.delete');

            if (playPauseButton) { // Si le bouton play/pause est cliqué
                const index = parseInt(playPauseButton.getAttribute('data-index'), 10); // Récupérer l'index
                this.playPauseSong(index); // Jouer ou mettre en pause la chanson
            }

            if (reloadButton) { // Si le bouton de rechargement est cliqué
                const index = parseInt(reloadButton.getAttribute('data-index'), 10); // Récupérer l'index
                this.reloadSong(index); // Recharger la chanson
            }

            if (deleteButton) { // Si le bouton de suppression est cliqué
                const index = parseInt(deleteButton.getAttribute('data-index'), 10); // Récupérer l'index
                this.deleteSong(index); // Supprimer la chanson
            }
        });

        // Mise à jour de la position dans la musique lors du changement du slider
        progressSlider.addEventListener('input', (event) => {
            const value = event.target.value;
            const newTime = (this.audio.duration * value) / 100;
            this.audio.currentTime = newTime;

            // Mettez à jour la couleur du slider
            this.updateProgress();
        });

        // Gestion du bouton de recul de 15 secondes
        seekBackwardButton.addEventListener('click', () => {
            this.audio.currentTime = Math.max(this.audio.currentTime - 15, 0);
            this.updateProgress(); // Met à jour la couleur
            this.updateSliderValue(); // Met à jour la position du slider
        });

        // Gestion du bouton d'avance de 15 secondes
        seekForwardButton.addEventListener('click', () => {
            this.audio.currentTime = Math.min(this.audio.currentTime + 15, this.audio.duration || 0);
            this.updateProgress(); // Met à jour la couleur
            this.updateSliderValue(); // Met à jour la position du slider
        });

        // Gérer les clics sur les boutons
        shuffleButton.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle; // Activer ou désactiver le mode aléatoire
            shuffleButton.classList.toggle('active', this.isShuffle); // Ajouter ou retirer la classe 'active'
            const shuffleImg = shuffleButton.querySelector('img');
            const shuffleText = shuffleButton.querySelector('span');
            shuffleImg.src = this.isShuffle
                ? `${getBaseURL()}../../assets/img/btnrdm_rose.png`
                : `${getBaseURL()}../../assets/img/btnrdm_bleu.png`;
            shuffleText.textContent = this.isShuffle ? 'Mode Aléatoire' : 'Mode Normal';
            console.log(`Shuffle mode is now ${this.isShuffle ? 'ON' : 'OFF'}`);
        });

        // Gérer les clics sur les boutons
        loopButton.addEventListener('click', () => {
            // Supprime les classes pour réinitialiser l'état visuel du bouton
            loopButton.classList.remove('single', 'all');
            const loopImg = loopButton.querySelector('img');
            const loopText = loopButton.querySelector('span');

            if (this.loopMode === 'none') {
                this.loopMode = 'one'; // Active la boucle sur une seule chanson
                loopButton.classList.add('single'); // Applique la classe pour le style visuel
                loopImg.src = `${getBaseURL()}../../assets/img/btnrepeat_pink.png`;
                loopText.textContent = 'Répéter une fois';
            } else if (this.loopMode === 'one') {
                this.loopMode = 'all'; // Active la boucle sur toute la playlist
                loopButton.classList.add('all');
                loopImg.src = `${getBaseURL()}../../assets/img/btnrepeat_pink.png`;
                loopText.textContent = 'En boucle';
            } else {
                this.loopMode = 'none'; // Désactive la boucle
                loopImg.src = `${getBaseURL()}../../assets/img/btnrepeat_bleu.png`;
                loopText.textContent = 'Type d\'écoute';
            }

            console.log(`Loop mode is now: ${this.loopMode}`); // Affiche le mode actuel dans la console
        });
    }

    // Fonction pour jouer ou mettre en pause une chanson
    playPauseSong(index) {
        const trackList = this.shadowRoot.querySelectorAll('.play-pause'); // Récupérer les boutons play/pause

        if (this.currentIndex === index) { // Si la chanson en cours est cliquée
            if (this.audio.paused) {
                this.audio.play(); // Jouer la chanson
            } else {
                this.audio.pause(); // Mettre en pause
            }
        } else { // Si une autre chanson est cliquée
            if (this.currentIndex !== null) {
                const previousButton = trackList[this.currentIndex];
                previousButton.querySelector('img').src = `${getBaseURL() + '../../assets/img/play.png'}`;
            }

            this.currentIndex = index;
            const selectedMusic = this.musicList[index];
            if (selectedMusic) {
                this.audio.src = selectedMusic.url;
                this.audio.play();

                // Réinitialise le slider à 0
                this.resetSlider();

                this.dispatchEvent(new CustomEvent('playSong', {
                    detail: { currentSong: selectedMusic },
                    bubbles: true,
                    composed: true,
                }));
            }
        }

        this.renderPlaylist(); // Mise à jour de l'affichage
    }

    // Fonction pour recharger une chanson
    reloadSong(index) {
        const selectedMusic = this.musicList[index]; // Récupérer la chanson sélectionnée
        this.audio.src = selectedMusic.url; // Charger la chanson
        this.audio.currentTime = 0; // Revenir au début
        this.audio.play(); // Jouer la chanson
        this.currentIndex = index; // Mettre à jour l'index
        this.renderPlaylist(); // Mise à jour de l'affichage
    }

    // Fonction pour supprimer une chanson
    deleteSong(index) {
        this.musicList.splice(index, 1); // Supprimer la chanson
        if (this.currentIndex === index) { // Si la chanson en cours est supprimée
            this.audio.pause(); // Mettre en pause la chanson
            this.currentIndex = null; // Réinitialiser l'index
        }
        this.renderPlaylist(); // Mise à jour de l'affichage
    }

    // Fonction pour gérer le drag-and-drop
    handleDragStart(event, index) {
        event.dataTransfer.setData('text/plain', index); // Stocker l'index de l'élément déplacé
    }

    // Fonction pour gérer le drag-and-drop
    handleDrop(event, targetIndex) {
        const draggedIndex = parseInt(event.dataTransfer.getData('text/plain'), 10); // Récupérer l'index de l'élément déplacé

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

    // Fonction pour initialiser le ResizeObserver
    initResizeObserver() {
        const observer = new ResizeObserver(() => {
            this.shadowRoot.querySelectorAll('.track-name').forEach((trackName) => {
                const textSpan = trackName.querySelector('span'); // Récupérer le span
                if (textSpan.scrollWidth > trackName.offsetWidth) { // Si le texte dépasse
                    trackName.classList.add('scrollable'); // Ajouter la classe 'scrollable'
                } else { // Sinon
                    trackName.classList.remove('scrollable'); // Supprimer la classe 'scrollable'
                }
            });
        });

        // Observez chaque élément .track-name
        this.shadowRoot.querySelectorAll('.track-name').forEach((trackName) => {
            observer.observe(trackName); // Observer l'élément
        });

        // Sauvegarder l'observer pour un éventuel nettoyage
        this.resizeObserver = observer;
    }

    // Fonction pour jouer la chanson suivante
    playNext() {
        if (this.loopMode === 'one') { // Boucle sur une seule chanson
            // Rejoue la même chanson
            console.log('Looping the same song.');
            this.audio.currentTime = 0; // Revenir au début
            this.audio.play(); // Jouer la chanson
        } else if (this.isShuffle) { // Mode aleatoire
            // Mode aléatoire
            let nextIndex; // Index de la chanson suivante
            do { // Trouver un index différent de l'index actuel
                nextIndex = Math.floor(Math.random() * this.musicList.length); // Index aléatoire
            } while (nextIndex === this.currentIndex && this.musicList.length > 1); // Répéter si l'index est le même

            console.log(`Shuffle mode: currentIndex=${this.currentIndex}, nextIndex=${nextIndex}`);
            this.currentIndex = nextIndex; // Mettre à jour l'index
            this.audio.src = this.musicList[nextIndex].url; // Charger la chanson suivante
            this.audio.play(); // Jouer la chanson
        } else {
            // Mode normal ou boucle sur toute la playlist
            const nextIndex = (this.currentIndex + 1) % this.musicList.length;
            if (nextIndex === 0 && this.loopMode !== 'all') { // Si la chanson suivante est la dernière
                console.log('End of playlist, stopping playback.'); // Arrêter la lecture
                this.audio.pause(); // Mettre en pause la chanson
                this.currentIndex = null; // Réinitialiser l'index
            } else {
                console.log(`Normal mode: moving to nextIndex=${nextIndex}`);
                this.currentIndex = nextIndex; // Mettre à jour l'index
                this.audio.src = this.musicList[nextIndex].url; // Charger la chanson suivante
                this.audio.play(); // Jouer la chanson
            }
        }

        // Réinitialise le slider à 0
        this.resetSlider();

        this.renderPlaylist(); // Mettre à jour l'affichage
    }

    updateProgress() {
        const progressSlider = this.shadowRoot.querySelector('.progress-slider');
        const currentTimeDisplay = this.shadowRoot.querySelector('.current-time');
        const totalDuration = this.audio.duration || 0;
        const currentTime = this.audio.currentTime || 0;
    
        if (totalDuration) {
            const progressPercent = (currentTime / totalDuration) * 100;
            progressSlider.value = progressPercent; // Met à jour la valeur du slider
            progressSlider.style.background = `linear-gradient(to right, #d3a761 ${progressPercent}%, #444450 ${progressPercent}%)`;
        }
    
        currentTimeDisplay.textContent = this.formatTime(currentTime);
    }
    

    updateTotalTime() {
        const totalTimeDisplay = this.shadowRoot.querySelector('.total-time');
        totalTimeDisplay.textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    }

    updateSliderValue() {
        const progressSlider = this.shadowRoot.querySelector('.progress-slider');
        const totalDuration = this.audio.duration || 0;
        const currentTime = this.audio.currentTime || 0;

        if (totalDuration) {
            const progressPercent = (currentTime / totalDuration) * 100;
            progressSlider.value = progressPercent; // Met à jour la valeur du slider
        }
    }

    resetSlider() {
        const progressSlider = this.shadowRoot.querySelector('.progress-slider');
        progressSlider.value = 0; // Réinitialise la position du slider
        progressSlider.style.background = 'linear-gradient(to right, #d3a761 0%, #444450 0%)'; // Réinitialise la couleur
    }
}

customElements.define('audio-playlist', Playlist);