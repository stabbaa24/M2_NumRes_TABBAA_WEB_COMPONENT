const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// // Template HTML pour le composant audio-volume
template.innerHTML = `
    <webaudio-knob id="volumeKnob" 
                   src="${getBaseURL() + '../../assets/img/volume.png'}"
                   min="0" max="1" 
                   value="0.5" 
                   step="0.01" 
                   diameter="64" 
                   sprites="100">
    </webaudio-knob>
`;

class AudioVolume extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.volumeKnob = null;
    }

    connectedCallback() {
        this.volumeKnob = this.shadowRoot.querySelector('#volumeKnob');
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.volumeKnob.addEventListener('input', (event) => {
            const volume = parseFloat(event.target.value);
            this.updateVolume(volume);
        });
    }

    updateVolume(volume) {
        // Émet un événement personnalisé pour transmettre le volume
        this.dispatchEvent(new CustomEvent('volumeChange', {
            detail: { volume },
            bubbles: true,
            composed: true
        }));
    }
}

// Définir le custom element <audio-volume>
customElements.define('audio-volume', AudioVolume);