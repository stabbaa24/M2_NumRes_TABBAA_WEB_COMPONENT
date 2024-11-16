const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le contrôle de vitesse
template.innerHTML = `
    <div class="audio-speed">
        <webaudio-slider 
            id="speedSlider"
            direction="horz"
            min="0.5"
            max="2"
            step="0.1"
            value="1"
            src="${getBaseURL() + '../../assets/img/hsliderbody.png'}"
            knobsrc="${getBaseURL() + '../../assets/img/hsliderknob.png'}">
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