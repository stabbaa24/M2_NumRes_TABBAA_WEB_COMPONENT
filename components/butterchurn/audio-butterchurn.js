const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le composant audio-butterchurn
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-butterchurn.css'}">
    <h3>Butterchurn</h3>
    <style>
        #visualizer {
            width: 100%;
            height: 100%;
            background: black;
        }
    </style>
    <div id="visualizer"></div>
`;

class AudioButterchurn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.visualizerContainer = null;
        this.visualizer = null; // Instance Butterchurn
        this.audioContext = null;
        this.mediaSource = null;
    }

    connectedCallback() {
        this.visualizerContainer = this.shadowRoot.querySelector('#visualizer');
    }

    initialize(audioContext, audioElement) {
        if (!this.visualizer) {
            // Créer une instance Butterchurn
            this.visualizer = butterchurn.createVisualizer(audioContext, this.visualizerContainer, {
                width: this.visualizerContainer.offsetWidth,
                height: this.visualizerContainer.offsetHeight,
                pixelRatio: window.devicePixelRatio || 1,
            });

            // Charger un preset inspiré d'Arcane
            const presets = butterchurnPresets.getPresets();
            const arcanePreset = presets['Ethereal Vibrations'] || Object.values(presets)[0];
            this.visualizer.loadPreset(arcanePreset, 1.0);

            // Mettre à jour la visualisation en boucle
            this.resizeObserver = new ResizeObserver(() => {
                this.visualizer.setRendererSize(
                    this.visualizerContainer.offsetWidth,
                    this.visualizerContainer.offsetHeight
                );
            });
            this.resizeObserver.observe(this.visualizerContainer);

            // Connecter la source audio
            this.mediaSource = audioContext.createMediaElementSource(audioElement);
            this.mediaSource.connect(audioContext.destination);
            this.visualizer.connectAudio(audioContext);
        }
    }

    startVisualization() {
        if (this.visualizer) {
            this.visualizer.render();
        }
    }

    stopVisualization() {
        if (this.visualizer) {
            this.visualizer.destroy();
            this.visualizer = null;
        }
    }
}

// Définir le custom element <audio-butterchurn>
customElements.define('audio-butterchurn', AudioButterchurn);