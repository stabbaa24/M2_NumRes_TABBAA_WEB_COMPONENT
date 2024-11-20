const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le contrôle de vitesse
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'controls-right.css'}">
    <div class="audio-speed">
        <webaudio-slider 
            id="speedSlider"
            min="0.5"
            max="1.5"
            step="0.1"
            value="1"
            src="${getBaseURL() + '../../assets/img/slider_4.png'}"
            knobsrc="${getBaseURL() + '../../assets/img/bouton_2.png'}"
            knobwidth="32"
            knobheight="32">
        </webaudio-slider>
    </div>
`;

class AudioSpeed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.speedSlider = null;
    }

    connectedCallback() {
        this.speedSlider = this.shadowRoot.querySelector('#speedSlider');
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Écoute les modifications de la vitesse
        this.speedSlider.addEventListener('input', (event) => {
            const speed = parseFloat(event.target.value);
            this.updateSpeed(speed);
        });
    }

    updateSpeed(speed) {
        // Émet un événement personnalisé pour transmettre la vitesse
        this.dispatchEvent(new CustomEvent('speedChange', {
            detail: { speed },
            bubbles: true,
            composed: true
        }));
    }
}

// Définir le custom element <audio-speed>
customElements.define('audio-speed', AudioSpeed);