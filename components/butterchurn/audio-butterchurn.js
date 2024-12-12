// audio-butterchurn.js
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
        this.animationFrame = null;
    }

    async initVisualizer(audioContext, audioElement) {
        try {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.visualizerContainer.innerHTML = '';
            this.visualizerContainer.appendChild(this.canvas);

            // Set canvas dimensions based on container size
            const rect = this.visualizerContainer.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;

            // Create visualizer
            this.visualizer = butterchurn.default.createVisualizer(
                audioContext,
                this.canvas,
                {
                    width: this.canvas.width,
                    height: this.canvas.height,
                    pixelRatio: window.devicePixelRatio || 1,
                }
            );

            // Listen to audio play/pause events
            audioElement.addEventListener('play', () => {
                this.isPlaying = true;
                this.startVisualization();
            });

            audioElement.addEventListener('pause', () => {
                this.isPlaying = false;
                this.stopVisualization();
            });

            audioElement.addEventListener('ended', () => {
                this.isPlaying = false;
                this.stopVisualization();
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                const rect = this.visualizerContainer.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                if (this.visualizer) {
                    this.visualizer.setRendererSize(this.canvas.width, this.canvas.height);
                }
            });

            // Load and populate presets
            await this.loadPresets();

            return true;
        } catch (error) {
            console.error('Error initializing visualizer:', error);
            return false;
        }
    }

    startVisualization() {
        if (!this.visualizer || !this.isPlaying) return;

        const render = () => {
            if (this.isPlaying) {
                this.visualizer.render();
                this.animationFrame = requestAnimationFrame(render);
            }
        };

        this.animationFrame = requestAnimationFrame(render);
    }

    stopVisualization() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    async loadPresets() {
        try {
            const presets = butterchurnPresets.getPresets();
            
            // Clear and populate preset select
            this.presetSelect.innerHTML = '';
            Object.keys(presets).forEach(presetName => {
                const option = document.createElement('option');
                option.value = presetName;
                option.textContent = presetName;
                this.presetSelect.appendChild(option);
            });

            // Load default preset
            const defaultPreset = Object.keys(presets)[0];
            await this.visualizer.loadPreset(presets[defaultPreset], 0.0);

            // Handle preset changes
            this.presetSelect.addEventListener('change', async (e) => {
                const selectedPreset = e.target.value;
                await this.visualizer.loadPreset(presets[selectedPreset], 0.0);
            });

        } catch (error) {
            console.error('Error loading presets:', error);
        }
    }
}

customElements.define('audio-butterchurn', AudioButterchurn);