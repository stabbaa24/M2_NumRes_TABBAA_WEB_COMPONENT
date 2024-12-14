import './audio-visualizer.js';

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
        this.renderSliders();
        this.distributePoints();
        this.drawGraph();

        this.canvas.addEventListener('mousedown', (e) => this.startDragging(e));
        this.canvas.addEventListener('mousemove', (e) => this.onDrag(e));
        this.canvas.addEventListener('mouseup', () => this.stopDragging());
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

        try {
            this.audioSource.disconnect();
        } catch (e) {
            console.log("Rien à déconnecter");
        }

        this.audioSource.connect(this.filters[0]);

        for (let i = 0; i < this.filters.length - 1; i++) {
            try {
                this.filters[i].disconnect();
            } catch (e) {
                console.log(`Rien à déconnecter pour le filtre ${i}`);
            }
            this.filters[i].connect(this.filters[i + 1]);
        }

        try {
            this.filters[this.filters.length - 1].disconnect();
        } catch (e) {
            console.log("Rien à déconnecter pour le dernier filtre");
        }
        this.filters[this.filters.length - 1].connect(this.audioContext.destination);

        console.log("Chaîne audio complètement reconnectée");
    }



    initFilters() {
        this.bands.forEach(({ freq }, index) => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq; // Fréquence centrale
            filter.Q.value = 1; // Qualité
            filter.gain.value = 0; // Gain initial
            this.filters.push(filter);
            console.log(`Filter ${index}: type=${filter.type}, freq=${filter.frequency.value} Hz, gain=${filter.gain.value}`);
        });

        console.log('Filters initialized with frequencies:', this.bands.map(b => b.freq));
    }

    renderSliders() {
        const sliderContainer = this.shadowRoot.querySelector('#slider-container');

        this.bands.forEach((band, index) => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.classList.add('slider-wrapper', 'eq-band');
            sliderWrapper.dataset.id = index;

            const formattedFreq = band.freq >= 1000 ?
                (band.freq / 1000) + 'k' :
                band.freq;

            sliderWrapper.innerHTML = `
                <div class="slider-color" id="color-${index}" style="background-color: ${band.color}"></div>
                <webaudio-slider
                    class="eq-slider"
                    data-id="${index}"
                    data-frequency="${band.freq}"
                    min="-12"
                    max="12"
                    step="1"
                    value="0"
                    direction="vertical"
                    src="${getBaseURL()}../../assets/img/slicer/slicer-${index + 1}.png"
                    knobsrc="${getBaseURL()}../../assets/img/slicer/slider.png"
                    width="50"
                    height="150"
                    knobwidth="25"
                    knobheight="25">
                </webaudio-slider>
                <span class="freq-label">${formattedFreq} Hz</span>
            `;

            sliderContainer.appendChild(sliderWrapper);

            const slider = sliderWrapper.querySelector('webaudio-slider');

            if (this.filters[index]) {
                this.filters[index].frequency.setValueAtTime(band.freq, this.audioContext.currentTime);
            }

            slider.addEventListener('change', (e) => {
                const gain = parseFloat(e.target.value);

                if (this.filters[index]) {
                    this.filters[index].gain.setValueAtTime(gain, this.audioContext.currentTime);
                    console.log(`Gain adjusted for ${band.freq}Hz: ${gain}dB`);

                    this.updateSliderGain(index, gain);
                }
            });
        });
    }

    updateSliderGain(index, gain) {
        const band = this.bands[index];
        band.gain = gain;
        band.y = this.canvas.height / 2 - (gain / 12) * (this.canvas.height / 2);

        if (this.filters[index]) {
            this.filters[index].gain.value = gain;

            console.log(`Filter ${index} gain set to ${gain} dB at frequency ${this.filters[index].frequency.value} Hz`);

            if (this.audioSource) {
                this.connectAudioSource(this.audioSource, this.audioContext);
            }
        }

        const slider = this.shadowRoot.querySelector(`#slider-${index}`);
        if (slider) {
            slider.value = gain;
        }

        this.drawGraph();
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

        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        this.bands.forEach((band, index) => {
            const y = this.canvas.height / 2 - (band.gain / 12) * (this.canvas.height / 2);
            band.y = y; 

            if (index === 0) {
                this.ctx.moveTo(band.x, band.y);
            } else {
                const prev = this.bands[index - 1];
                const cpX = (prev.x + band.x) / 2;
                this.ctx.bezierCurveTo(cpX, prev.y, cpX, band.y, band.x, band.y);
            }
        });

        this.ctx.stroke();

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