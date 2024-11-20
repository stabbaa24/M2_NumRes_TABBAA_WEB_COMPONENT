const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour l'égaliseur
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-equalizer.css'}">
    <div class="audio-equalizer">
        <h3>Égaliseur</h3>
        <div class="equalizer-bands">
            <!-- Chaque slider représente une bande de fréquence -->
        </div>
    </div>
`;

class AudioEqualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.bands = [60, 170, 350, 1000, 3500, 10000]; // Fréquences des bandes
        this.filters = []; // Les filtres associés à chaque bande
        this.audioContext = null; // Contexte audio
        this.audioSource = null; // Source audio
        this.audioDestination = null; // Destination audio
    }

    connectedCallback() {
        this.renderBands();
        this.initAudioContext();
    }

    renderBands() {
        const bandsContainer = this.shadowRoot.querySelector('.equalizer-bands');

        // Créer un slider pour chaque bande
        this.bands.forEach((freq, index) => {
            const band = document.createElement('div');
            band.classList.add('band');
            band.innerHTML = `
                <label for="band-${freq}">${freq} Hz</label>
                <input type="range" id="band-${freq}" data-index="${index}" min="-30" max="30" value="0" step="1" />
            `;
            bandsContainer.appendChild(band);
        });

        // Ajouter des écouteurs d'événements pour les sliders
        bandsContainer.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT') {
                const index = parseInt(event.target.dataset.index, 10);
                const gain = parseFloat(event.target.value);
                this.updateFilterGain(index, gain);
            }
        });
    }

    initAudioContext() {
        // Initialiser le contexte audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Créer des filtres pour chaque bande
        this.bands.forEach((freq) => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'peaking'; // Égaliseur type "peaking"
            filter.frequency.value = freq; // Fréquence centrale
            filter.Q.value = 1; // Largeur de bande
            filter.gain.value = 0; // Gain initial
            this.filters.push(filter);
        });

        // Connecter les filtres en chaîne
        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]);
        }

        // Destination finale
        this.audioDestination = this.audioContext.destination;
        this.filters[this.filters.length - 1].connect(this.audioDestination);
    }

    connectAudioSource(audioElement) {
        // Connecter une source audio existante à l'égaliseur
        if (!this.audioSource) {
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);
            this.audioSource.connect(this.filters[0]); // Connecter au premier filtre
        }
    }

    updateFilterGain(index, gain) {
        // Mettre à jour le gain pour la bande correspondante
        if (this.filters[index]) {
            this.filters[index].gain.value = gain;
        }
    }
}

// Définir le custom element <audio-equalizer>
customElements.define('audio-equalizer', AudioEqualizer);
