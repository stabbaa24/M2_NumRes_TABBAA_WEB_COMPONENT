const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le composant audio-mute
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'controls-right.css'}">
    <h3>Muet</h3>
    <webaudio-switch id="muteToggle"
                     src="${getBaseURL() + '../../assets/img/mute_skull.png'}"
                     width="128"
                     height="128">
    </webaudio-switch>
`;

class AudioMute extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.isMuted = false; // État du mute
    }

    connectedCallback() {
        this.muteToggle = this.shadowRoot.querySelector('#muteToggle');
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.muteToggle.addEventListener('click', () => {
            this.toggleMute();
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;

        // Émet un événement personnalisé pour transmettre l'état du mute
        this.dispatchEvent(new CustomEvent('muteChange', {
            detail: { isMuted: this.isMuted },
            bubbles: true,
            composed: true
        }));
    }
}

// Définir le custom element <audio-mute>
customElements.define('audio-mute', AudioMute);