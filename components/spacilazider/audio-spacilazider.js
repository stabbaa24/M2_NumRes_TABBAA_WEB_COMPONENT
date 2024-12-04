const template = document.createElement('template');

// Base URL for the component
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// HTML Template
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-spacilazider.css'}">
    <h3>Spacilazider</h3>
    <div class="spatialize-container">
        <div class="spatialize-indicator" id="up">
            <img src="${getBaseURL()}../../assets/img/up-arrow.png" alt="Up">
        </div>
        <div class="spatialize-indicator" id="left">
            <img src="${getBaseURL()}../../assets/img/left-arrow.png" alt="Left">
        </div>
        <div class="spatialize-indicator" id="right">
            <img src="${getBaseURL()}../../assets/img/right-arrow.png" alt="Right">
        </div>
        <div class="spatialize-indicator" id="down">
            <img src="${getBaseURL()}../../assets/img/down-arrow.png" alt="Down">
        </div>
    </div>

`;

class AudioSpacilazider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audioContext = null;
        this.stereoPanner = null;
        this.audioSource = null;
        this.activeIndicator = null; // Track the active indicator
    }

    connectedCallback() {
        this.initAudioContext();
        this.addEventListeners();
    }

    initAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a StereoPannerNode
        this.stereoPanner = this.audioContext.createStereoPanner();
        this.stereoPanner.connect(this.audioContext.destination);
    }

    connectAudioSource(audioElement) {
        if (!this.audioSource) {
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);
            this.audioSource.connect(this.stereoPanner);
        }
    }

    addEventListeners() {
        const leftIndicator = this.shadowRoot.querySelector('#left');
        const rightIndicator = this.shadowRoot.querySelector('#right');
        const upIndicator = this.shadowRoot.querySelector('#up'); // Up and down are ignored for stereo panning
        const downIndicator = this.shadowRoot.querySelector('#down');

        leftIndicator.addEventListener('click', () => {
            this.setPan(-1); // Full left
            this.activateIndicator(leftIndicator);
        });

        rightIndicator.addEventListener('click', () => {
            this.setPan(1); // Full right
            this.activateIndicator(rightIndicator);
        });

        upIndicator.addEventListener('click', () => {
            this.setPan(0); // Center for simplicity
            this.activateIndicator(upIndicator);
        });

        downIndicator.addEventListener('click', () => {
            this.setPan(0); // Center for simplicity
            this.activateIndicator(downIndicator);
        });
    }

    setPan(value) {
        if (this.stereoPanner) {
            this.stereoPanner.pan.setValueAtTime(value, this.audioContext.currentTime);
            console.log(`Setting stereo pan to: ${value}`);
        }
    }

    activateIndicator(indicator) {
        const indicators = this.shadowRoot.querySelectorAll('.spatialize-indicator');
        indicators.forEach((el) => el.classList.remove('active'));
        indicator.classList.add('active');
    }
}

customElements.define('audio-spacilazider', AudioSpacilazider);