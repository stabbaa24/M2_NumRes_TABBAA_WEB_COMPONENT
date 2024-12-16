const template = document.createElement('template');

// Fonction pour obtenir l'URL de base
const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour l'égaliseur
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-equalizer.css'}">
    <h3>Egaliseur de fréquence</h3>
    <div id="eq-container">
        <div id="visualizer-container">
            <canvas id="visualizer"></canvas>
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
            { id: 0, freq: 32, gain: 0 },    // Basses extrêmes
            { id: 1, freq: 65, gain: 0 },   // Basses
            { id: 2, freq: 130, gain: 0 },  // Médiums-basses
            { id: 3, freq: 261, gain: 0 },  // Bas-médiums
            { id: 4, freq: 523, gain: 0 },  // Médiums
            { id: 5, freq: 1000, gain: 0 }, // Médiums-hauts
            { id: 6, freq: 2000, gain: 0 }, // Hautes fréquences
            { id: 7, freq: 4100, gain: 0 }  // Très hautes fréquences
        ];

        this.filters = [];
        this.analyser = null;
        this.audioContext = null;
        this.audioSource = null;
        this.animationFrameId = null;
        this.isRunning = false;
        this.canvas = null;
        this.canvasCtx = null;
        this.dataArray = null;
        this.audioMotion = null;
    }

    connectedCallback() {
        this.renderSliders();
    }

    async setupAudioMotion() {
        import('https://cdn.skypack.dev/audiomotion-analyzer').then(({ default: AudioMotionAnalyzer }) => {
            const container = this.shadowRoot.querySelector('#visualizer-container');

            if (!this.audioContext) {
                console.log('Audio context not available');
                return;
            }
            else {
                console.log('MIAOOOOOO');
            }

            try {
                this.audioMotion = new AudioMotionAnalyzer(container, {
                    source: this.analyser,
                    height: 150,
                    width: container.clientWidth,
                    bgAlpha: 0.1,
                    mode: 10,
                    smoothing: 0.7,
                    gradient: 'rainbow',
                    minFreq: 20,
                    maxFreq: 6000,
                    showScaleX: true,
                    showPeaks: true,
                    fillAlpha: 0.5,
                    useCanvas: true,
                    radial: false,
                    showBgColor: false,
                    overlay: true,
                    showScaleY: true,
                    lineWidth: 2,
                    maxDecibels: -20,
                    minDecibels: -60
                });

                console.log('AudioMotion initialized successfully');
            } catch (error) {
                console.error('Error initializing AudioMotion:', error);
            }
        });
    }

    getOutput() {
        return this.analyser;
    }

    async connectAudioSource(audioSourceNode, audioContext) {
        this.audioContext = audioContext;
        this.audioSource = audioSourceNode;

        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.7;
        }

        if (this.filters.length === 0) {
            this.initFilters();
        }

        try {
            // Connect the chain
            this.audioSource.disconnect();
            this.audioSource.connect(this.filters[0]);
            
            for (let i = 0; i < this.filters.length - 1; i++) {
                this.filters[i].connect(this.filters[i + 1]);
            }
            
            // Connect last filter to analyser
            this.filters[this.filters.length - 1].connect(this.analyser);
            
            await this.setupAudioMotion();
        } catch (error) {
            console.error('Error in audio connections:', error);
        }
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
                    this.updateAudioChain();
                }
            });
        });
    }

    updateSliderGain(index, gain) {
        const band = this.bands[index];

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
    }

    updateAudioChain() {
        try {
            this.audioSource.disconnect();
            console.log('Previous connections cleared');

            this.audioSource.connect(this.filters[0]);
            for (let i = 0; i < this.filters.length - 1; i++) {
                this.filters[i].connect(this.filters[i + 1]);
            }
            this.filters[this.filters.length - 1].connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            console.log('Audio chain updated successfully');
        } catch (error) {
            console.error('Error updating audio chain:', error);
        }
    }

}

customElements.define('audio-equalizer', AudioEqualizer);