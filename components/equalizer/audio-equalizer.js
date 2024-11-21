const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour l'égaliseur
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-equalizer.css'}">
    <div id="eq-container">
        <!-- Container pour le graphique -->
        <div id="graph-container">
            <canvas id="graph-canvas"></canvas>
        </div>

        <!-- Container pour les sliders -->
        <div id="slider-container"></div>
    </div>
`;

class AudioEqualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.bands = [
            { id: 0, freq: 63, gain: 0, color: '#9b5de5' },
            { id: 1, freq: 136, gain: 0, color: '#f15bb5' },
            { id: 2, freq: 294, gain: 0, color: '#fee440' },
            { id: 3, freq: 632, gain: 0, color: '#00bbf9' },
            { id: 4, freq: 1363, gain: 0, color: '#00f5d4' },
            { id: 5, freq: 2936, gain: 0, color: '#ff5f57' },
            { id: 6, freq: 6324, gain: 0, color: '#56b4d3' },
        ];

        this.filters = [];
        this.audioContext = null;
        this.audioSource = null;
        this.canvas = null;
        this.ctx = null;
        this.dragging = null;
    }

    connectedCallback() {
        this.initCanvas();
        this.initAudioContext();
        this.renderSliders();
        this.distributePoints();
        this.drawGraph();

        this.canvas.addEventListener('mousedown', (e) => this.startDragging(e));
        this.canvas.addEventListener('mousemove', (e) => this.onDrag(e));
        this.canvas.addEventListener('mouseup', () => this.stopDragging());
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.bands.forEach(({ freq }) => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            this.filters.push(filter);
        });

        // Connect filters in series
        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]);
        }

        // Connect last filter to the destination
        this.filters[this.filters.length - 1].connect(this.audioContext.destination);
        console.log('Audio context and filters initialized.');
    }

    connectAudioSource(audioElement) {
        if (!this.audioSource || this.audioSource.mediaElement !== audioElement) {
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);

            // Connect the source to the first filter
            this.audioSource.connect(this.filters[0]);

            // Ensure the last filter is connected to the destination
            this.filters[this.filters.length - 1].connect(this.audioContext.destination);

            console.log('Audio source connected to equalizer filters.');
        }
    }

    renderSliders() {
        const sliderContainer = this.shadowRoot.querySelector('#slider-container');

        this.bands.forEach((band, index) => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.classList.add('slider-wrapper');
            sliderWrapper.dataset.id = index;

            sliderWrapper.innerHTML = `
                <div class="slider-color" id="color-${index}" style="background-color: ${band.color}"></div>
                <input type="range" min="-12" max="12" value="0" class="slider" id="slider-${index}">
                <label>${band.freq} Hz</label>
            `;

            sliderContainer.appendChild(sliderWrapper);

            sliderWrapper.querySelector('input').addEventListener('input', (e) => {
                const gain = parseFloat(e.target.value);
                this.updateSliderGain(index, gain);
            });
        });
    }

    distributePoints() {
        const step = this.canvas.width / (this.bands.length + 1);
        this.bands.forEach((band, index) => {
            band.x = step * (index + 1);
            band.y = this.canvas.height / 2;
        });
    }

    drawGraph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();

        // Draw curve
        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.bands.forEach((band, index) => {
            if (index === 0) {
                this.ctx.moveTo(band.x, band.y);
            } else {
                const prev = this.bands[index - 1];
                const cpX = (prev.x + band.x) / 2;
                this.ctx.bezierCurveTo(cpX, prev.y, cpX, band.y, band.x, band.y);
            }
        });
        this.ctx.stroke();

        // Draw points
        this.bands.forEach((band) => {
            this.ctx.beginPath();
            this.ctx.arc(band.x, band.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = band.color;
            this.ctx.fill();
            this.ctx.stroke();
        });
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

    startDragging(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        this.dragging = this.bands.find((band) =>
            Math.hypot(band.x - mouseX, band.y - mouseY) < 10
        );
    }

    onDrag(e) {
        if (!this.dragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;

        this.dragging.y = Math.min(
            Math.max(mouseY, 0),
            this.canvas.height
        );

        const gain = Math.round(
            ((this.canvas.height / 2 - this.dragging.y) / (this.canvas.height / 2)) * 12
        );
        this.updateSliderGain(this.dragging.id, gain);
    }

    stopDragging() {
        this.dragging = null;
    }

    updateSliderGain(index, gain) {
        const band = this.bands[index];
        band.gain = gain;
        band.y = this.canvas.height / 2 - (gain / 12) * (this.canvas.height / 2);

        if (this.filters[index]) {
            this.filters[index].gain.value = gain;
        }

        const slider = this.shadowRoot.querySelector(`#slider-${index}`);
        if (slider) {
            slider.value = gain;
        }

        this.drawGraph();
    }

    initCanvas() {
        this.canvas = this.shadowRoot.querySelector('#graph-canvas');
        this.ctx = this.canvas.getContext('2d');

        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.distributePoints();
        this.drawGraph();
    }
}

customElements.define('audio-equalizer', AudioEqualizer);