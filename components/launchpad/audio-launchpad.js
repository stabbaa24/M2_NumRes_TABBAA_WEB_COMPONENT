const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour le launchpad
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-launchpad.css'}">
    <div class="title-container">
        <h3>Soundboard</h3>
    </div>
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
        this.setupKeyboardEvents(); // Configure les événements du clavier
    }

    loadLaunchpad() {
        const grid = this.shadowRoot.querySelector('.launchpad-grid');

        for (let i = 0; i < 9; i++) {
            const button = document.createElement('button');
            button.classList.add('launchpad-button');
            button.textContent = `Sound ${i + 1}`;

            const audio = new Audio(`${getBaseURL()}../../assets/music/launchpad/sound${i + 1}.mp3`);
            this.launchpadSounds.push(audio);

            // Ajoute un événement de clic pour jouer le son et gérer l'animation
            button.addEventListener('click', () => {
                audio.currentTime = 0;
                audio.play();

                // Ajoute la classe "clicked" pour l'animation
                button.classList.add('clicked');

                // Retire la classe après 5 secondes (durée de l'animation)
                setTimeout(() => {
                    button.classList.remove('clicked');
                }, 5000);

                // Dispatch un événement pour transmettre des images associées au son
                const images = [];
                for (let j = 1; j <= 3; j++) {
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

    triggerSound(index) {
        const audio = this.launchpadSounds[index];
        const button = this.shadowRoot.querySelectorAll('.launchpad-button')[index];

        audio.currentTime = 0;
        audio.play();

        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 5000);

        // Dispatch de l'événement avec images
        const images = [];
        for (let j = 1; j <= 3; j++) {
            images.push(`${getBaseURL()}../../assets/img/launchpad/sound${index + 1}/sound_${index + 1}_image_${j}.png`);
        }
        this.dispatchEvent(new CustomEvent('launchpadSoundPlayed', {
            detail: { images },
            bubbles: true,
            composed: true
        }));
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key >= '1' && key <= '9') {
                const index = key - '1'; // Converti la touche en index (0 à 8)
                this.triggerSound(index);
            }
        });
    }
}

// Définit le composant <audio-launchpad>
customElements.define('audio-launchpad', AudioLaunchpad);
