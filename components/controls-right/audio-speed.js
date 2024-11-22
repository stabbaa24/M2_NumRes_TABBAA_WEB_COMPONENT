const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le contrôle de vitesse
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'controls-right.css'}">
    <h3>Vitesse</h3>
    <div class="audio-speed">
        <webaudio-knob id="speedSlider"
                       src="${getBaseURL() + '../../assets/img/Half_Punk_Blue.png'}"
                       min="0" max="2" 
                       value="1" 
                       step="0.1" 
                       diameter="128" >
        </webaudio-knob>
    </div>
`;

class AudioSpeed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.speedSlider = null; // Référence au contrôle de vitesse
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    connectedCallback() {
        this.speedSlider = this.shadowRoot.querySelector('#speedSlider'); // Récupérer le contrôle de vitesse
        this.attachEventListeners(); // Attacher les écouteurs d'événements
    }

    // Fonction pour attacher les écouteurs d'événements
    attachEventListeners() {
        // Écoute les modifications de la vitesse
        this.speedSlider.addEventListener('input', (event) => {
            const speed = parseFloat(event.target.value); // Récupérer la vitesse
            this.updateSpeed(speed); // Mettre à jour la vitesse
        });
    }

    // Fonction pour mettre à jour la vitesse
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