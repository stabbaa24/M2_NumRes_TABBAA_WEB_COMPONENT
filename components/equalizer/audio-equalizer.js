import './audio-visualizer.js';

const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-equalizer.css'}">
    <div id="eq-container">
        <div id="graph-container">
            <canvas id="graph-canvas"></canvas>
        </div>
        <div id="slider-container">
            ${[63, 136, 294, 632, 1363, 2936, 6324]
                .map((freq, index) => `
                    <div class="eq-band">
                        <div class="slider-color" id="color-${index}"></div>
                        <webaudio-slider
                            class="eq-slider"
                            data-id="${index}"
                            data-frequency="${freq}"
                            min="-12"
                            max="12"
                            step="1"
                            value="0"
                            direction="vertical"
                            src="${getBaseURL() + '../../assets/img/slicer/slicer-' + (index + 1) + '.png'}"
                            knobsrc="${getBaseURL() + '../../assets/img/slicer/slider.png'}"
                            width="50"
                            height="150"
                            knobwidth="25"
                            knobheight="25">
                        </webaudio-slider>
                        <span class="freq-label">${freq >= 1000 ? (freq / 1000) + 'k' : freq} Hz</span>
                    </div>
                `).join('')}
        </div>
    </div>
`;

class AudioEqualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audioContext = null;
        this.audioSource = null;
        this.filters = [];
        this.sliders = [];
        this.canvas = null;
        this.ctx = null;

        this.bands = [63, 136, 294, 632, 1363, 2936, 6324];
    }

    connectedCallback() {
        this.sliders = Array.from(this.shadowRoot.querySelectorAll('.eq-slider'));
        this.canvas = this.shadowRoot.querySelector('#graph-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeCanvas();
        this.attachEventListeners();
    }

    connectAudioSource(audioSourceNode, audioContext) {
        if (!audioSourceNode || !audioContext) {
            console.warn('Audio source or AudioContext is missing!');
            return;
        }

        this.audioContext = audioContext;
        this.audioSource = audioSourceNode;

        if (this.filters.length === 0) {
            this.initFilters();
        }

        // Reconnect the audio chain
        this.audioSource.disconnect();
        this.audioSource.connect(this.filters[0]);

        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]);
        }

        this.filters[this.filters.length - 1].connect(this.audioContext.destination);
    }

    initFilters() {
        this.filters = this.bands.map(freq => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1; // Adjust quality factor for sharper/narrower filters
            filter.gain.value = 0;
            return filter;
        });
    }

    attachEventListeners() {
        this.sliders.forEach((slider, index) => {
            slider.addEventListener('input', () => {
                const gain = parseFloat(slider.value);
                this.updateSliderGain(index, gain);
            });
        });
    }

    updateSliderGain(index, gain) {
        if (this.filters[index]) {
            this.filters[index].gain.setValueAtTime(gain, this.audioContext.currentTime);
        }
        this.updateVisualization();
    }

    initializeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.updateVisualization();
    }

    updateVisualization() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw EQ curve
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#56b4d3';
        this.ctx.lineWidth = 2;

        this.sliders.forEach((slider, index) => {
            const x = (index / (this.sliders.length - 1)) * this.canvas.width;
            const gain = parseFloat(slider.value);
            const y = ((-gain + 12) / 24) * this.canvas.height;

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

customElements.define('audio-equalizer', AudioEqualizer);
