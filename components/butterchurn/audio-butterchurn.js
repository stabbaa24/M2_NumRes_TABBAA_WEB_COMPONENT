import "../../libs/butterchurn.js";
import "../../libs/butterchurnPresets.min.js";

const templateButterchurn = document.createElement('template');
templateButterchurn.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }
        #visualizer-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        canvas {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        #preset-select {
            width: 80%;
            margin: 10px auto;
            padding: 5px;
            background: rgba(27, 27, 41, 0.8);
            color: #d3a761;
            border: 1px solid #444450;
            border-radius: 5px;
            font-size: 14px;
            z-index: 10;
        }
    </style>
    <select id="preset-select"></select>
    <div id="visualizer-container"></div>
`;

export class AudioButterchurn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(templateButterchurn.content.cloneNode(true));
        
        this.visualizerContainer = this.shadowRoot.querySelector('#visualizer-container');
        this.presetSelect = this.shadowRoot.querySelector('#preset-select');
        this.visualizer = null;
        this.canvas = null;
        this.isPlaying = false;
        this.animationFrameId = null;
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
                select {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 1;
                }
            `;
            this.shadowRoot.appendChild(style);

            // Create canvas and select elements
            this.canvas = document.createElement('canvas');
            this.visualizerContainer.appendChild(this.canvas);
            this.shadowRoot.appendChild(this.presetSelect);

            // Load presets immediately
            await this.loadPresetList();

            this.isInitialized = true;
        }
    }

    async initVisualizer(audioContext, audioElement) {
        try {
            // Initialize visualizer with provided audioContext
            this.visualizer = butterchurn.default.createVisualizer(
                audioContext,
                this.canvas, {
                    width: this.canvas.width,
                    height: this.canvas.height
                }
            );

            // Set second preset as default
            const presetKeys = Object.keys(butterchurnPresets.getPresets());
            if (presetKeys.length > 1) {
                await this.visualizer.loadPreset(
                    butterchurnPresets.getPresets()[presetKeys[1]], 
                    0.0
                );
                this.presetSelect.value = presetKeys[1];
            }

            // Attach audio event listeners
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