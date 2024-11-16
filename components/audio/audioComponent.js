import '../playlist/audio-playlist.js';

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
        <link rel="stylesheet" href="${getBaseURL() + '../../grid.css'}"> <!-- Remonte de deux niveaux pour accéder à grid.css -->
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

        // Sous web component - Contrôles gauche
        const controlsLeftComponent = document.createElement('audio-controls');
        this.shadowRoot.querySelector('.controls-left').appendChild(controlsLeftComponent);

        // Sous web component - Contrôles droite
        const controlsRightComponent = document.createElement('audio-controls');
        this.shadowRoot.querySelector('.controls-right').appendChild(controlsRightComponent);

        // Sous web component - Vinyle
        const vinylComponent = document.createElement('audio-vinyl');
        this.shadowRoot.querySelector('.vinyl').appendChild(vinylComponent);

        // Sous web component - Launchpad
        const launchpadComponent = document.createElement('audio-launchpad');
        this.shadowRoot.querySelector('.launchpad').appendChild(launchpadComponent);
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);