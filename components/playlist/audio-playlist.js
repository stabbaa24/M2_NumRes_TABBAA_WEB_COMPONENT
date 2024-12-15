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

        this.audio = new Audio(); // Créer un élément audio
        this.currentIndex = null; // Index de la chanson en cours de lecture
        this.isShuffle = false; // Mode aléatoire
        this.loopMode = 'none'; // 'all', 'one', or 'none'
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    async connectedCallback() {
        await this.loadMusicFiles();
        this.loadDurations();
        this.renderPlaylist();
        this.attachEventListeners();
        this.initResizeObserver();

        // Passer à la chanson suivante automatiquement à la fin de la chanson
        this.audio.addEventListener('ended', () => {
            console.log('Song ended, playing next.');
            this.playNext(); // Jouer la chanson suivante
        });
    }

    async loadMusicFiles() {
        try {
            const response = await fetch(`${getBaseURL()}musicList.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch music list: ${response.statusText}`);
            }
    
            this.musicList = await response.json();
            console.log('Loaded music list:', this.musicList);
        } catch (error) {
            console.error('Error loading music list:', error);
        }
    }
    

    // Fonction appelée lorsque le composant est déconnecté du DOM
    loadDurations() {
        this.musicList.forEach((music, index) => {
            const tempAudio = new Audio(music.url); // Créer un élément audio temporaire
            tempAudio.addEventListener('loadedmetadata', () => {
                this.musicList[index].duration = tempAudio.duration; // Mettre à jour la durée
                this.renderPlaylist(); // Mettre à jour l'affichage
            });
        });
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

        // Gérer les clics sur les boutons
        shuffleButton.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle; // Activer ou désactiver le mode aléatoire
            shuffleButton.classList.toggle('active', this.isShuffle); // Ajouter ou retirer la classe 'active'
            shuffleButton.textContent = this.isShuffle ? '🔀 Mode Aléatoire' : '🔀 Mode Aléatoire';
            console.log(`Shuffle mode is now ${this.isShuffle ? 'ON' : 'OFF'}`);
        });

        // Gérer les clics sur les boutons
        loopButton.addEventListener('click', () => {
            // Supprime les classes pour réinitialiser l'état visuel du bouton
            loopButton.classList.remove('single', 'all');

            if (this.loopMode === 'none') {
                this.loopMode = 'one'; // Active la boucle sur une seule chanson
                loopButton.textContent = '🔂 Une seule chanson'; // Mise à jour du texte
                loopButton.classList.add('single'); // Applique la classe pour le style visuel
            } else if (this.loopMode === 'one') {
                this.loopMode = 'all'; // Active la boucle sur toute la playlist
                loopButton.textContent = '🔁 Toute la playlist';
                loopButton.classList.add('all');
            } else {
                this.loopMode = 'none'; // Désactive la boucle
                loopButton.textContent = '🔂 Jouer en boucle ?';
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

        this.renderPlaylist(); // Mettre à jour l'affichage
    }

}

customElements.define('audio-playlist', Playlist);