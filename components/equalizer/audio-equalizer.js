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
            { id: 0, freq: 63, gain: 0, color: '#000080' },    // bleu foncé
            { id: 1, freq: 136, gain: 0, color: '#00FFFF' },   // bleu cyan
            { id: 2, freq: 294, gain: 0, color: '#FFA500' },   // orange
            { id: 3, freq: 632, gain: 0, color: '#FF69B4' },   // rose
            { id: 4, freq: 1363, gain: 0, color: '#FF0000' },  // rouge
            { id: 5, freq: 2936, gain: 0, color: '#00FF00' },  // vert
            { id: 6, freq: 6324, gain: 0, color: '#800080' },  // violet
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
        this.setupAudioMotion();
    }

    setupAudioMotion() {
        import('https://cdn.skypack.dev/audiomotion-analyzer').then(({ default: AudioMotionAnalyzer }) => {
            const container = this.shadowRoot.querySelector('#visualizer-container');
            
            if (!this.audioContext) {
                console.log('Waiting for audio context...');
                return;
            }

            try {
                this.audioMotion = new AudioMotionAnalyzer(container, {
                    source: this.analyser, // Connecter directement à l'analyseur
                    height: 150,
                    width: container.clientWidth,
                    bgAlpha: 0.7,
                    mode: 2,
                    smoothing: 0.7,
                    gradient: 'prism',
                    minFreq: 20,
                    maxFreq: 16000,
                    showScaleX: true,
                    showPeaks: true,
                    fillAlpha: 0.7,
                    useCanvas: true,
                    radial: false,
                    showBgColor: true,
                    overlay: true
                });

                console.log('AudioMotion initialized successfully');
            } catch (error) {
                console.error('Error initializing AudioMotion:', error);
            }
        });
    }

    connectAudioSource(audioSourceNode, audioContext) {
        this.audioContext = audioContext;
        this.audioSource = audioSourceNode;

        // Créer l'analyseur avant tout
        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.7;
            console.log('Analyser created');
        }

        if (this.filters.length === 0) {
            this.initFilters();
        }

        try {
            // Déconnecter tout d'abord
            this.audioSource.disconnect();
            console.log('Previous connections cleared');

            // Connecter dans l'ordre : source -> filters -> analyser -> destination
            this.audioSource.connect(this.filters[0]);
            for (let i = 0; i < this.filters.length - 1; i++) {
                this.filters[i].connect(this.filters[i + 1]);
            }
            this.filters[this.filters.length - 1].connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            console.log('Audio connections established');

            // Initialiser audioMotion après les connexions
            if (!this.audioMotion) {
                this.setupAudioMotion();
            }
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
}

customElements.define('audio-equalizer', AudioEqualizer);