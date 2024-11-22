const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le launchpad
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-launchpad.css'}">
    <h3>Launchpad</h3>
    <div class="launchpad-grid"></div>
`;

class AudioLaunchpad extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.launchpadSounds = []; // Tableau pour stocker les sons
    }

    // Fonction appelée lorsque le composant est connecté au DOM
    connectedCallback() {
        this.loadLaunchpad(); // Charge le launchpad
    }

    loadLaunchpad() {
        const grid = this.shadowRoot.querySelector('.launchpad-grid');

        for (let i = 0; i < 20; i++) {
            const button = document.createElement('button');
            button.classList.add('launchpad-button');
            button.textContent = `Sound ${i + 1}`;

            const audio = new Audio(`${getBaseURL()}../../assets/music/launchpad/sound${i + 1}.mp3`);
            this.launchpadSounds.push(audio);

            button.addEventListener('click', () => {
                audio.currentTime = 0;
                audio.play();

                // Dispatch an event to notify about the sound and its images
                const images = [];
                for (let j = 1; j <= 4; j++) {
                    images.push(`${getBaseURL()}../../assets/img/launchpad/sound${i + 1}/sound_${i + 1}_image_${j}.png`);
                }
                this.dispatchEvent(new CustomEvent('launchpadSoundPlayed', {
                    detail: { images },
                    bubbles: true,
                    composed: true
                }));
            });

            grid.appendChild(button);
        }
    }
}

// Définit le composant <audio-launchpad>
customElements.define('audio-launchpad', AudioLaunchpad);
