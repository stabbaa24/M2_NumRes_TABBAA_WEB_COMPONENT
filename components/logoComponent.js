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
    const templateHTML = await loadHTML('./logoComponent.html', getBaseURL()); // Charger le fichier HTML du composant
    template.innerHTML = `
        <link rel="stylesheet" href="${getBaseURL() + 'logoComponent.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'grid.css'}">
        ${templateHTML}
    `;
};

// Appel asynchrone pour charger le template avant de continuer
await loadTemplate();

/**
 * Définir la classe du composant <logo-generator>
 */
export class LogoGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Ouvrir le shadow DOM

        // Définir des valeurs par défaut
        this._text = 'Logo Exemple';
        this._colorTitle = '#000000';
        this._fontSizeTitle = 32;
        this._backgroundTitle = '';
        this._textureTitle = '';
    }

    async connectedCallback() {
        // Attendre le template complet avant d'attacher les éléments
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialiser le formulaire et le logo
        this.initElements(); // Initialiser les éléments du DOM
        this.attachEventListeners(); // Attacher les événements du formulaire
        this.renderLogo(); // Afficher le logo
    }

    // Initialiser les éléments du DOM
    initElements() {
        this.logoDisplay = this.shadowRoot.querySelector('#logoDisplay');
        this.textInput = this.shadowRoot.querySelector('#logoTitle');
        this.colorTitleInput = this.shadowRoot.querySelector('#colorTitle');
        this.fontSizeTitleInput = this.shadowRoot.querySelector('#fontSizeTitle');
        this.backgroundTitleSelect = this.shadowRoot.querySelector('#backgroundTitle');
        this.textureTitleSelect = this.shadowRoot.querySelector('#textureTitle');
        this.updateButton = this.shadowRoot.querySelector('#updateLogo');

        // Initialiser les champs avec les valeurs actuelles
        this.textInput.value = this._text;
        this.colorTitleInput.value = this._colorTitle;
        this.fontSizeTitleInput.value = this._fontSizeTitle;
        this.backgroundTitleSelect.value = this._backgroundTitle;
        this.textureTitleSelect.value = this._textureTitle;
    }

    // Attacher les événements du formulaire
    attachEventListeners() {
        this.updateButton.addEventListener('click', () => this.updateLogo());
    }

    // Mettre à jour les propriétés à partir du formulaire et afficher le logo
    updateLogo() {
        this._text = this.textInput.value;
        this._colorTitle = this.colorTitleInput.value;
        this._fontSizeTitle = this.fontSizeTitleInput.value;
        this._backgroundTitle = this.backgroundTitleSelect.value;
        this._textureTitle = this.textureTitleSelect.value;

        this.renderLogo();
    }

    // Afficher le logo avec les propriétés actuelles
    renderLogo() {
        this.logoDisplay.textContent = this._text;
        this.logoDisplay.style.color = this._colorTitle;
        this.logoDisplay.style.fontSize = `${this._fontSizeTitle}px`;

        // Appliquer la texture de fond si disponible
        if (this._backgroundTitle) {
            this.logoDisplay.style.backgroundImage = `url(${this._backgroundTitle})`;
        }

        // Appliquer la texture du texte si disponible
        if (this._textureTitle) {
            this.logoDisplay.style.backgroundClip = 'text';
            this.logoDisplay.style.webkitBackgroundClip = 'text';
            this.logoDisplay.style.color = 'transparent';
            this.logoDisplay.style.backgroundImage = `url(${this._textureTitle})`;
        }
    }

    // Getters et setters pour les propriétés
    set text(value) {
        this._text = value;
        this.renderLogo();
    }

    get text() {
        return this._text;
    }

    set colorTitle(value) {
        this._colorTitle = value;
        this.renderLogo();
    }

    get colorTitle() {
        return this._colorTitle;
    }

    set fontSizeTitle(value) {
        this._fontSizeTitle = value;
        this.renderLogo();
    }

    get fontSizeTitle() {
        return this._fontSizeTitle;
    }

    set backgroundTitle(value) {
        this._backgroundTitle = value;
        this.renderLogo();
    }

    get backgroundTitle() {
        return this._backgroundTitle;
    }

    set textureTitle(value) {
        this._textureTitle = value;
        this.renderLogo();
    }

    get textureTitle() {
        return this._textureTitle;
    }
}

// Définir le custom element <logo-generator>
customElements.define('logo-generator', LogoGenerator);
