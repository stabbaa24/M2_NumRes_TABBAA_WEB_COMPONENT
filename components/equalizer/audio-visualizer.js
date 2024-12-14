const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour l'égaliseur
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-visualizer.css'}">

    <div id="container">
        <canvas id="canvas"></canvas>
    </div>
    <audio id="audio" controls crossorigin></audio>
    <input id="audioFileInput" type="file" accept="audio/*" style="display:none;">
`;

class AudioVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audioCtx = new AudioContext();
        this.audioPlayer = this.shadowRoot.querySelector('#audio');
        this.localAudioElement = this.shadowRoot.querySelector('#audioFileInput');
        this.canvas = this.shadowRoot.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
        this.analyser = this.audioCtx.createAnalyser();

        this.dataArray = new Float32Array(this.analyser.fftSize);

        this.visualizerSettings = {
            fftSize: 4096,
            numBands: 240,
            autoScale: true,
            smoothingTimeConstant: 0.8,
            darkMode: false,
        };

        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.visualize = this.visualize.bind(this);
    }

    connectedCallback() {
        this.localAudioElement.addEventListener('change', (event) => this.loadLocalFile(event));
        this.setupAudioProcessing();
        this.setupCanvas();

        window.addEventListener('resize', this.resizeCanvas);
        this.resizeCanvas();

        this.visualize();
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.resizeCanvas);
    }

    setupAudioProcessing() {
        const audioSource = this.audioCtx.createMediaElementSource(this.audioPlayer);
        audioSource.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
    }

    setupCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.ctx.fillStyle = this.visualizerSettings.darkMode ? '#000' : '#fff';
        this.ctx.strokeStyle = this.visualizerSettings.darkMode ? '#fff' : '#000';
    }

    resizeCanvas() {
        this.canvas.width = this.shadowRoot.host.clientWidth;
        this.canvas.height = this.shadowRoot.host.clientHeight;
    }

    loadLocalFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
        this.audioPlayer.src = e.target.result;
        this.audioPlayer.play();
        };

        reader.readAsDataURL(file);
    }

    visualize() {
        this.analyser.fftSize = this.visualizerSettings.fftSize;
        this.analyser.smoothingTimeConstant = this.visualizerSettings.smoothingTimeConstant;

        this.analyser.getFloatTimeDomainData(this.dataArray);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const bufferLength = this.analyser.frequencyBinCount;
        const barWidth = (this.canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
        const barHeight = (this.dataArray[i] + 1) * this.canvas.height / 2;

        this.ctx.fillStyle = `rgb(${Math.floor(barHeight + 100)},50,50)`;
        this.ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
        }

        requestAnimationFrame(this.visualize);
    }
}

customElements.define('audio-visualizer', AudioVisualizer);
