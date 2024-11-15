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

    async connectedCallback() {
        // Charger et attacher le template au Shadow DOM
        if (!template.innerHTML.includes('<div class="container">')) { // Vérifie que le template est chargé une seule fois
            await loadTemplate();
        }
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialiser les sous-composants et les ajouter dans chaque conteneur
        this.initSubComponents();
    }

    initSubComponents() {
        // Ajouter le sous-composant de playlist dans le conteneur "playlist"
        const playlistComponent = document.createElement('audio-playlist');
        this.shadowRoot.querySelector('.playlist').appendChild(playlistComponent);

        // Ajouter d'autres sous-composants dans leurs conteneurs respectifs
        const vinylLeftComponent = document.createElement('audio-vinyl');
        this.shadowRoot.querySelector('.vinyl-left').appendChild(vinylLeftComponent);

        const vinylRightComponent = document.createElement('audio-vinyl');
        this.shadowRoot.querySelector('.controls-right').appendChild(vinylRightComponent);

        const visualizationComponent = document.createElement('audio-visualization');
        this.shadowRoot.querySelector('.visualization').appendChild(visualizationComponent);

        const launchpadComponent = document.createElement('audio-launchpad');
        this.shadowRoot.querySelector('.launchpad').appendChild(launchpadComponent);
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);