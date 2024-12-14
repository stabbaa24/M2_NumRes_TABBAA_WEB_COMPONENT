const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le composant audio-volume
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'controls-right.css'}">
    <h3>Volume</h3>
    <webaudio-knob id="volumeKnob" 
                   src="${getBaseURL() + '../../assets/img/Half_Punk_Orange.png'}"
                   min="0" max="1" 
                   value="0.5" 
                   step="0.01" 
                   diameter="128">
    </webaudio-knob>
`;

class AudioVolume extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.volumeKnob = null; // Référence au contrôle de volume
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    connectedCallback() {
        this.volumeKnob = this.shadowRoot.querySelector('#volumeKnob');
        this.attachEventListeners();
    }

    // Fonction pour attacher les écouteurs d'événements
    attachEventListeners() {
        this.volumeKnob.addEventListener('input', (event) => {
            const volume = parseFloat(event.target.value);
            this.updateVolume(volume);
        });
    }

    // Fonction pour mettre à jour le volume
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