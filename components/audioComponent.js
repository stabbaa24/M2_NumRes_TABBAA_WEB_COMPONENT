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

       
    }

    /**
     * Méthode appelée lorsque le composant est connecté au DOM 
     * pour pouvoir initialiser les éléments du composant
     */
    async connectedCallback() {
        // Attendre le template complet avant d'attacher les éléments
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialiser les éléments du DOM
        this.initElements();
        this.attachEventListeners();
    }

    // Initialiser les éléments du DOM
    initElements() {
        
    }

    // Attacher les événements du formulaire
    attachEventListeners() {
        
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);
