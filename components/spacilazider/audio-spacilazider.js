const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-spacilazider.css'}">
    <h3>Balance</h3>
    <div class="spatialize-container">
        <button id="pan-left">Gauche</button>
        <button id="pan-center">Centre</button>
        <button id="pan-right">Droite</button>
    </div>
`;

class AudioSpacilazider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audioContext = null;
        this.stereoPanner = null;
    }

    connectedCallback() {
        this.addEventListeners();
    }

    connectAudioSource(audioSource, audioContext) {
        if (audioSource && audioContext) {
            this.audioContext = audioContext;

            if (!this.stereoPanner) {
                this.stereoPanner = this.audioContext.createStereoPanner();
            }

            audioSource.disconnect();
            audioSource.connect(this.stereoPanner).connect(this.audioContext.destination);

            console.log('Audio source connected to stereo panner.');
        }
    }

    setPan(value) {
        if (this.stereoPanner) {
            this.stereoPanner.pan.setValueAtTime(value, this.audioContext.currentTime);
            console.log(`Panning défini à : ${value}`);
            this.dispatchEvent(new CustomEvent('panChange', {
                detail: { panValue: value },
                bubbles: true,
                composed: true,
            }));
        } else {
            console.warn('StereoPannerNode is not initialized.');
        }
    }

    addEventListeners() {
        const panLeft = this.shadowRoot.querySelector('#pan-left');
        const panCenter = this.shadowRoot.querySelector('#pan-center');
        const panRight = this.shadowRoot.querySelector('#pan-right');

        panLeft.addEventListener('click', () => this.setPan(-1)); // Gauche
        panCenter.addEventListener('click', () => this.setPan(0)); // Centre
        panRight.addEventListener('click', () => this.setPan(1)); // Droite
    }
}

customElements.define('audio-spacilazider', AudioSpacilazider);
