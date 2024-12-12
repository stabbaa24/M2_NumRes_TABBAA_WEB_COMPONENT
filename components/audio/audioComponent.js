import '../playlist/audio-playlist.js';
import '../controls-right/audio-volume.js';
import '../controls-right/audio-mute.js';
import '../controls-right/audio-speed.js';
import '../equalizer/audio-equalizer.js';
import '../launchpad/audio-launchpad.js';
import '../launchpad/audio-launchpad-effect.js';
import '../spacilazider/audio-spacilazider.js';
import '../butterchurn/audio-butterchurn.js';

const template = document.createElement('template');

// Définition de l'URL de base pour accéder aux fichiers dans le répertoire "components/audio"
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Fonction pour charger un fichier HTML
async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    const response = await fetch(htmlUrl);
    return response.text();
}

// Fonction d'initialisation du template avec les styles et le contenu HTML
const loadTemplate = async () => {
    const templateHTML = await loadHTML('audioComponent.html', getBaseURL());
    template.innerHTML = `
        <link rel="stylesheet" href="${getBaseURL() + 'audioComponent.css'}">
        <link rel="stylesheet" href="${getBaseURL() + '../../grid.css'}">
        ${templateHTML}
    `;
};

export class AudioGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // Fonction appelée lorsque le composant est ajouté au DOM
    async connectedCallback() {
        // Si le template n'a pas encore été chargé, le charger
        if (!template.innerHTML.includes('<div class="container">')) {
            await loadTemplate();
        }
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialiser les sous-composants et les ajouter dans chaque conteneur
        this.initSubComponents();
    }

    // Fonction pour initialiser les sous-composants
    initSubComponents() {
        // Sous web component - Playlist
        const playlistComponent = document.createElement('audio-playlist');
        this.shadowRoot.querySelector('.playlist').appendChild(playlistComponent);

        // Sous web component - Contrôles droit - Volume
        const controlsRightComponentVolume = document.createElement('audio-volume');
        this.shadowRoot.querySelector('.controls-right').appendChild(controlsRightComponentVolume);

        // Sous web component - Contrôles droit - Mute
        const controlsRightComponentMute = document.createElement('audio-mute');
        this.shadowRoot.querySelector('.controls-right').appendChild(controlsRightComponentMute);

        // Sous web component - Contrôles droit - Vitesse
        const controlsRightComponentSpeed = document.createElement('audio-speed');
        this.shadowRoot.querySelector('.controls-right').appendChild(controlsRightComponentSpeed);

        // Sous web component - Contrôles gauche - Égaliseur
        const controlsLeftComponentEqualizer = document.createElement('audio-equalizer');
        this.shadowRoot.querySelector('.equalizer').appendChild(controlsLeftComponentEqualizer);

        // Sous web component - Launchpad
        const launchpadComponent = document.createElement('audio-launchpad');
        this.shadowRoot.querySelector('.launchpad').appendChild(launchpadComponent);

        // Sous web component - Launchpad Effect
        const launchpadEffectComponent = document.createElement('audio-launchpad-effect');
        this.shadowRoot.querySelector('.launchpad-effect').appendChild(launchpadEffectComponent);

        // Sous web component - Spacilazider
        const spacilaziderComponent = document.createElement('audio-spacilazider');
        this.shadowRoot.querySelector('.spacilazider').appendChild(spacilaziderComponent);

        // Sous web component - Butterchurn
        const butterchurnComponent = document.createElement('audio-butterchurn');
        this.shadowRoot.querySelector('.butterchurn').appendChild(butterchurnComponent);

        let audioContext = null;
        let mediaSource = null;

        playlistComponent.addEventListener('playSong', async () => {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        
            if (!mediaSource) {
                mediaSource = audioContext.createMediaElementSource(playlistComponent.audio);
            }
        
            spacilaziderComponent.connectAudioSource(mediaSource, audioContext);
            
            // Utiliser initVisualizer au lieu de initialize
            const isInitialized = await butterchurnComponent.initVisualizer(audioContext, playlistComponent.audio);
            
            // Ne démarrer la visualisation que si l'initialisation a réussi
            if (isInitialized) {
                butterchurnComponent.startVisualization();
            }
        });

        // Écouter les changements de pan
        spacilaziderComponent.addEventListener('panChange', (event) => {
            const panValue = event.detail.panValue;
            console.log(`Spatialisation : Pan défini à ${panValue}`);
        });

        // Écouter les changements de volume
        controlsRightComponentVolume.addEventListener('volumeChange', (event) => {
            const volume = event.detail.volume;
            const playlistComponent = this.shadowRoot.querySelector('audio-playlist');
            if (playlistComponent && playlistComponent.audio) {
                playlistComponent.audio.volume = volume;
            }
        });

        // Écouter les changements de mute
        controlsRightComponentMute.addEventListener('muteChange', (event) => {
            const isMuted = event.detail.isMuted;
            const playlistComponent = this.shadowRoot.querySelector('audio-playlist');
            if (playlistComponent && playlistComponent.audio) {
                playlistComponent.audio.muted = isMuted;
            }
        });

        // Écouter les changements de vitesse
        controlsRightComponentSpeed.addEventListener('speedChange', (event) => {
            const speed = event.detail.speed;

            // Mettre à jour la vitesse de lecture dans la playlist
            const playlistComponent = this.shadowRoot.querySelector('audio-playlist');
            if (playlistComponent && playlistComponent.audio) {
                playlistComponent.audio.playbackRate = speed;
            }

        });
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);