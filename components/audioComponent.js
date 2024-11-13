const template = document.createElement('template');

// Fonction pour obtenir l'URL de base (le répertoire du script)
const getBaseURL = () => new URL('.', import.meta.url);

// Fonction pour charger un fichier HTML
async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    const response = await fetch(htmlUrl);
    return response.text();
}

// Fonction d'initialisation pour charger le template HTML
const loadTemplate = async () => {
    const templateHTML = await loadHTML('./audioComponent.html', getBaseURL());
    template.innerHTML = `
        <link rel="stylesheet" href="${getBaseURL() + 'audioComponent.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'grid.css'}">
        ${templateHTML}
    `;
};

// Charger le template avant de continuer
await loadTemplate();

/**
 * Classe du composant <audio-generator>
 */
class AudioGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Créer le shadow DOM
    }

    async connectedCallback() {
        // Attendre le template et attacher au shadow DOM
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialiser l'élément audio, le bouton de volume, la sélection de fichier, et le bouton de lecture
        this.initAudio();
        this.initVolumeKnob();
        this.initFileInput();
        this.initPlayButton();
    }

    initAudio() {
        console.log("Initializing audio element...");
        this.audioElement = document.createElement('audio');
        this.audioElement.loop = true;
    }

    initVolumeKnob() {
        const volumeKnob = this.shadowRoot.getElementById('volumeKnob');
        console.log("Initializing volume knob...");

        // Synchroniser le bouton de volume avec l'élément audio
        volumeKnob.addEventListener('input', (event) => {
            this.audioElement.volume = event.target.value;
            console.log("Volume set to:", event.target.value);
        });
    }

    initFileInput() {
        const fileInput = this.shadowRoot.getElementById('fileInput');
        console.log("Initializing file input...");

        // Écouteur pour le changement de fichier
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file);
                this.audioElement.src = fileURL;
                console.log("File selected:", file.name);
            }
        });
    }

    initPlayButton() {
        const playButton = this.shadowRoot.getElementById('playButton');
        console.log("Initializing play button...");

        // Écouteur pour démarrer la lecture lorsque le bouton est cliqué
        playButton.addEventListener('click', () => {
            if (this.audioElement.src) {
                this.audioElement.play().then(() => {
                    console.log("Audio is playing...");
                }).catch((error) => {
                    console.error("Error playing audio:", error);
                });
            } else {
                alert("Veuillez d'abord sélectionner un fichier audio.");
            }
        });
    }
}

// Définir le custom element <audio-generator>
customElements.define('audio-generator', AudioGenerator);