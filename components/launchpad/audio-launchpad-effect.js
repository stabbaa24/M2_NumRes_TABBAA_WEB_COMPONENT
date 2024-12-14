const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le launchpad effect
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-launchpad-effect.css'}">
    <div class="effect-container"></div>
`;

class AudioLaunchpadEffect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    connectedCallback() {
        this.effectContainer = this.shadowRoot.querySelector('.effect-container');
        document.addEventListener('launchpadSoundPlayed', (event) => {
            this.displayEffects(event.detail.images);
        });
    }

    /**
     * Affiche les quatre images associées à un son.
     * @param {Array} imageSources - Liste des chemins des images.
     */
    displayEffects(imageSources) {
        // Efface les anciens effets
        this.effectContainer.innerHTML = '';

        // Ajoute chaque image
        imageSources.forEach((imageSrc) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.classList.add('launchpad-effect-image');
            img.style.left = `${Math.random() * 80}%`; // Position aléatoire
            img.style.top = `${Math.random() * 80}%`; // Position aléatoire
            this.effectContainer.appendChild(img);

            // Supprime l'image après l'animation
            setTimeout(() => {
                img.remove();
            }, 2000);
        });
    }
}

// Définit le composant <audio-launchpad-effect>
customElements.define('audio-launchpad-effect', AudioLaunchpadEffect);