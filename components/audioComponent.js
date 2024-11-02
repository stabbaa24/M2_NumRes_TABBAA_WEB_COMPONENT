const template = document.createElement('template'); // Créer un template HTML

const getBaseURL = () => {
    return new URL('.', import.meta.url); // Fonction pour obtenir l'URL de base (le répertoire du script)
};

// Fonction pour charger un fichier HTML
async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href; // Obtenir l'URL absolue du fichier HTML
    const response = await fetch(htmlUrl); // Charger le fichier HTML
    return response.text(); // Retourner le contenu du fichier HTML
}

// Fonction d'initialisation asynchrone qui attend le chargement complet du HTML
const loadTemplate = async () => {
    const templateHTML = await loadHTML('./audioComponent.html', getBaseURL()); // Charger le fichier HTML du composant
    template.innerHTML = `
        <link rel="stylesheet" href="${getBaseURL() + 'audioComponent.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'grid.css'}">
        ${templateHTML}
    `;
};

// Appel asynchrone pour charger le template avant de continuer 
await loadTemplate();

/**
 * Définir la classe du composant <audio-generator>
 */
export class AudioGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Ouvrir le shadow DOM

        // Variables pour gérer le lecteur YouTube
        this.player = null;
        this.youtubeUrl = null;
    }

    /**
     * Méthode appelée lorsque le composant est connecté au DOM 
     * pour pouvoir initialiser les éléments du composant
     */
    async connectedCallback() {
        // Attendre le template complet avant d'attacher les éléments
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Charger l'API YouTube IFrame
        this.loadYouTubeAPI();

        // Initialiser les éléments du DOM
        this.initElements();
        this.attachEventListeners();
    }

    // Charger l'API YouTube IFrame
    loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        // Créer une fonction globale nécessaire pour l'API
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API loaded');
        };
    }

    // Initialiser les éléments du DOM
    initElements() {
        this.youtubeUrlInput = this.shadowRoot.querySelector('#youtubeUrl');
        this.loadVideoBtn = this.shadowRoot.querySelector('#loadVideoBtn');
        this.playPauseBtn = this.shadowRoot.querySelector('#playPauseBtn');
        this.stopBtn = this.shadowRoot.querySelector('#stopBtn');
        this.speedUpBtn = this.shadowRoot.querySelector('#speedUpBtn');
        this.slowDownBtn = this.shadowRoot.querySelector('#slowDownBtn');
        this.muteBtn = this.shadowRoot.querySelector('#muteBtn');
        this.volumeRange = this.shadowRoot.querySelector('#volumeRange');
        this.audioDisplay = this.shadowRoot.querySelector('#audioDisplay');
    }

    // Attacher les événements du formulaire
    attachEventListeners() {
        // Charger la vidéo YouTube
        this.loadVideoBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            const videoId = this.extractVideoId(this.youtubeUrlInput.value);
            if (videoId) {
                this.loadYouTubeVideo(videoId);
            }
        });

        // Bouton Play/Pause
        this.playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            this.togglePlayPause();
        });

        // Bouton Stop
        this.stopBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            this.stopVideo();
        });

        // Bouton Speed Up
        this.speedUpBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            this.changePlaybackSpeed(0.25);
        });

        // Bouton Slow Down
        this.slowDownBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            this.changePlaybackSpeed(-0.25);
        });

        // Bouton Mute
        this.muteBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Empêcher le rafraîchissement de la page
            this.toggleMute();
        });

        // Volume Range
        this.volumeRange.addEventListener('input', (e) => {
            const value = e.target.value;
            if (this.player) {
                this.player.setVolume(value);
            }
        });
    }


    // Extraire l'ID de la vidéo YouTube à partir de l'URL
    extractVideoId(url) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
    }

    // Charger et afficher la vidéo YouTube dans l'iframe
    loadYouTubeVideo(videoId) {
        if (!this.player) {
            this.player = new YT.Player(this.audioDisplay, {
                height: '390',
                width: '640',
                videoId: videoId,
                events: {
                    onReady: this.onPlayerReady.bind(this),
                }
            });
        } else {
            this.player.loadVideoById(videoId);
        }
    }

    // Quand le lecteur est prêt
    onPlayerReady(event) {
        console.log('Player ready');
    }

    // Basculer entre Play et Pause
    togglePlayPause() {
        if (this.player) {
            const state = this.player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                this.player.pauseVideo();
            } else {
                this.player.playVideo();
            }
        }
    }

    // Arrêter la vidéo
    stopVideo() {
        if (this.player) {
            this.player.stopVideo();
        }
    }

    // Modifier la vitesse de lecture
    changePlaybackSpeed(delta) {
        if (this.player) {
            const currentSpeed = this.player.getPlaybackRate();
            const newSpeed = Math.min(Math.max(currentSpeed + delta, 0.25), 2); // Limiter entre 0.25x et 2x
            this.player.setPlaybackRate(newSpeed);
        }
    }

    // Activer/désactiver le mode muet
    toggleMute() {
        if (this.player) {
            if (this.player.isMuted()) {
                this.player.unMute();
            } else {
                this.player.mute();
            }
        }
    }

    // Volume Range
    updateVolumeRange(value) {
        this.volumeRange.value = value;
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);
