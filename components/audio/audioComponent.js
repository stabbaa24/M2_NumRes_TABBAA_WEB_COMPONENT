import '../playlist/audio-playlist.js';
import '../controls-right/audio-volume.js';
import '../controls-right/audio-mute.js';
import '../vynil/audio-vynil.js';
import '../controls-right/audio-speed.js';

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

        // Sous web component - Vynile
        const vinylComponent = document.createElement('audio-vinyl');
        this.shadowRoot.querySelector('.vinyl-disk').appendChild(vinylComponent);

        // Sous web component - Contrôles droit - Vitesse
        const controlsRightComponentSpeed = document.createElement('audio-speed');
        this.shadowRoot.querySelector('.controls-right').appendChild(controlsRightComponentSpeed);

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

    // Mettre à jour la vitesse de rotation du vinyle
    const vinylComponent = this.shadowRoot.querySelector('audio-vinyl');
    if (vinylComponent) {
        vinylComponent.dispatchEvent(new CustomEvent('playMusic', {
            detail: { playbackRate: speed },
            bubbles: true,
            composed: true
        }));
    }
});

        // Écouter l'événement de lecture depuis la playlist
        playlistComponent.addEventListener('playSong', (event) => {
            const playbackRate = playlistComponent.audio?.playbackRate || 1;
            vinylComponent.dispatchEvent(new CustomEvent('playMusic', {
                detail: { playbackRate },
                bubbles: true,
                composed: true
            }));
        });

        // Écouter l'événement de pause depuis l'audio de la playlist
        playlistComponent.audio?.addEventListener('pause', () => {
            vinylComponent.dispatchEvent(new CustomEvent('pauseMusic', {
                bubbles: true,
                composed: true
            }));
        });

        // Écouter le clic sur le bouton reload et déclencher l'événement pour le vinyle
        playlistComponent.addEventListener('reloadSong', () => {
            vinylComponent.dispatchEvent(new CustomEvent('reloadMusic', {
                bubbles: true,
                composed: true
            }));
        });
    }

}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);