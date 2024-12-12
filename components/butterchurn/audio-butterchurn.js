// audio-butterchurn.js
import "../../libs/butterchurn.js";
import "../../libs/butterchurnPresets.min.js";

// audio-butterchurn.js
const templateButterchurn = document.createElement('template');
templateButterchurn.innerHTML = `
    <style>
        
        #visualizer {
            width: 100%;
            height: 100%;
        }
        canvas {
            width: 100%;
            height: 100%;
        }
    </style>
    <div id="visualizer"></div>
`;

export class AudioButterchurn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(templateButterchurn.content.cloneNode(true));
        this.visualizerContainer = this.shadowRoot.querySelector('#visualizer');
        this.visualizer = null;
        this.presets = null;
        this.currentPreset = null;
        this.canvas = null;
        this.autoResize = true;
    }

    async initVisualizer(audioContext, audioElement) {
        try {
            // Create canvas
            this.canvas = document.createElement('canvas'); 
            this.visualizerContainer.innerHTML = '';
            this.visualizerContainer.appendChild(this.canvas);
    
            // Set initial dimensions
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.canvas.width = width * window.devicePixelRatio;
            this.canvas.height = height * window.devicePixelRatio;
    
            // Create visualizer using butterchurn.default
            this.visualizer = butterchurn.default.createVisualizer(
                audioContext,
                this.canvas, 
                {
                    width: this.canvas.width,
                    height: this.canvas.height,
                    pixelRatio: window.devicePixelRatio || 1,
                }
            );
    
            // Handle resize
            window.addEventListener('resize', () => {
                if (!this.autoResize) return;
                const width = window.innerWidth;
                const height = window.innerHeight; 
                this.canvas.width = width * window.devicePixelRatio;
                this.canvas.height = height * window.devicePixelRatio;
                if (this.visualizer) {
                    this.visualizer.setRendererSize(this.canvas.width, this.canvas.height);
                }
            });
    
            return true;
        } catch (error) {
            console.error('Error initializing visualizer:', error);
            return false;
        }
    }

    startVisualization() {
        if (!this.visualizer) return;

        const render = () => {
            this.visualizer.render();
            requestAnimationFrame(render);
        };

        render();
    }

    async loadPresets() {
        try {
            this.presets = butterchurnPresets.getPresets();
            const defaultPreset = Object.keys(this.presets)[0];
            await this.visualizer.loadPreset(this.presets[defaultPreset], 0.0);
        } catch (error) {
            console.error('Error loading presets:', error); 
        }
    }
}

customElements.define('audio-butterchurn', AudioButterchurn);