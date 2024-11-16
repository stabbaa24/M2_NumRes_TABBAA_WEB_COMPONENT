const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le vinyle avec une image
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-vynil.css'}">
    <div class="vinyl">
        <img src="${getBaseURL() + '../../assets/img/vinyl.png'}" alt="Vinyl" class="vinyl-image"/>
    </div>
`;

class AudioVinyl extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.vinylElement = null;
    }

    connectedCallback() {
        this.vinylElement = this.shadowRoot.querySelector('.vinyl-image');
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Écouter les événements personnalisés pour contrôler la rotation du vinyle
        this.addEventListener('playMusic', (event) => {
            const { playbackRate } = event.detail;
            this.startSpinning(playbackRate);
        });

        this.addEventListener('pauseMusic', () => {
            this.stopSpinning();
        });

        this.addEventListener('reloadMusic', () => {
            this.reloadSpinning();
        });
    }

    startSpinning(playbackRate) {
        if (this.vinylElement) {
            const animationDuration = Math.max(1, 5 / playbackRate);
        this.vinylElement.style.animation = `spin ${animationDuration}s linear infinite`;
        }
    }

    stopSpinning() {
        if (this.vinylElement) {
            this.vinylElement.style.animation = 'none'; // Arrête l'animation
        }
    }

    reloadSpinning() {
        if (this.vinylElement) {
            // Redémarre l'animation depuis le début
            this.vinylElement.style.animation = 'none'; // Désactive l'animation
            void this.vinylElement.offsetWidth; // Force le reflow pour redémarrer l'animation
            this.vinylElement.style.animation = `spin 5s linear infinite`; // Réactive l'animation
        }
    }
}

// Définir le custom element <audio-vinyl>
customElements.define('audio-vinyl', AudioVinyl);
