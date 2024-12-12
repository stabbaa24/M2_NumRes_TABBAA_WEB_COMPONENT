import "../../libs/butterchurn.js";
import "../../libs/butterchurnPresets.min.js";

const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

template.innerHTML = `
<link rel="stylesheet" href="${getBaseURL() + 'audio-butterchurn.css'}">
<h3>Butterchurn</h3>
<div id="container">
    <select id="preset-select"></select>
    <canvas></canvas>
</div>

`;

export class AudioButterchurn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.presetSelect = this.shadowRoot.querySelector('#preset-select');
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.visualizer = null;
        this.isPlaying = false;
        this.animationFrameId = null;
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            await this.loadPresetList();
            this.isInitialized = true;
        }
    }

    async initVisualizer(audioContext, audioElement) {
        try {
            this.visualizer = butterchurn.default.createVisualizer(
                audioContext,
                this.canvas, {
                width: this.canvas.width,
                height: this.canvas.height
            }
            );

            const presetKeys = Object.keys(butterchurnPresets.getPresets());
            if (presetKeys.length > 1) {
                await this.visualizer.loadPreset(
                    butterchurnPresets.getPresets()[presetKeys[1]],
                    0.0
                );
                this.presetSelect.value = presetKeys[1];
            }

            audioElement.addEventListener('play', () => {
                this.startVisualization();
            });

            audioElement.addEventListener('pause', () => {
                this.stopVisualization();
            });

            audioElement.addEventListener('ended', () => {
                this.stopVisualization();
            });

            return true;
        } catch (error) {
            console.error('Error initializing visualizer:', error);
            return false;
        }
    }

    startVisualization() {
        if (!this.visualizer) return;

        this.isPlaying = true;
        this.renderLoop();
    }

    stopVisualization() {
        this.isPlaying = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    renderLoop = () => {
        if (this.visualizer && this.isPlaying) {
            this.visualizer.render();
            this.animationFrameId = requestAnimationFrame(this.renderLoop);
        }
    }

    async loadPresetList() {
        try {
            const presets = butterchurnPresets.getPresets();
            const presetKeys = Object.keys(presets);

            presetKeys.forEach(presetName => {
                const option = document.createElement('option');
                option.value = presetName;
                option.textContent = presetName;
                this.presetSelect.appendChild(option);
            });

            this.presetSelect.addEventListener('change', async (e) => {
                const selectedPreset = e.target.value;
                await this.visualizer.loadPreset(presets[selectedPreset], 0.0);
            });

        } catch (error) {
            console.error('Error loading presets:', error);
        }
    }

    disconnectedCallback() {
        this.stopVisualization();
    }
}

customElements.define('audio-butterchurn', AudioButterchurn);