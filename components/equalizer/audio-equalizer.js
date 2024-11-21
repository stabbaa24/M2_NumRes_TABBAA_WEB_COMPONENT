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
    this.audioDestination = null;
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

    // Attach event listeners for the graph
    // Événements pour interagir avec les points
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    
      this.dragging = this.bands.find(
        (band) => Math.hypot(band.x - mouseX, band.y - mouseY) < 10
      );
    });
    

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    
      // Vérifier si un point est cliqué
      this.dragging = this.bands.find(
        (band) => Math.hypot(band.x - mouseX, band.y - mouseY) < 10
      );
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
    
      const rect = this.canvas.getBoundingClientRect();
      this.dragging.y = Math.min(
        Math.max(e.clientY - rect.top, 0), // Limite supérieure
        this.canvas.height // Limite inférieure
      );
    
      // Synchroniser le slider correspondant
      const slider = this.shadowRoot.querySelector(`#slider-${this.dragging.id}`);
      this.dragging.gain = Math.round(((this.canvas.height / 2 - this.dragging.y) / (this.canvas.height / 2)) * 12);
      slider.value = this.dragging.gain;
    
      this.drawGraph();
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.dragging = null;
    });

    // Synchroniser sliders -> boutons
    document.querySelectorAll('.slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const id = parseInt(e.target.id.split('-')[1]);
        const band = this.bands.find((b) => b.id === id);
    
        band.gain = parseFloat(e.target.value);
        band.y = this.canvas.height / 2 - (band.gain / 12) * (this.canvas.height / 2);
    
        this.drawGraph();
      });
    });
    


    // Ajoutez ce log pour voir si les événements sont correctement attachés
    console.log('Canvas event listeners attached');
  }


  initCanvas() {
    this.canvas = this.shadowRoot.querySelector('#graph-canvas');
    this.ctx = this.canvas.getContext('2d');
  
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  
    console.log(`Canvas dimensions: width=${this.canvas.width}, height=${this.canvas.height}`);
  
    this.distributePoints(); // Recalcule les positions des boutons
    this.drawGraph(); // Redessine le graphique
  }
  
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  
    if (this.audioContext.state === 'suspended') {
      const resumeContext = () => {
        this.audioContext.resume().then(() => {
          console.log('AudioContext resumed');
          document.removeEventListener('click', resumeContext); // Nettoyage
        });
      };
  
      document.addEventListener('click', resumeContext);
    }
  
    this.bands.forEach(({ freq }) => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      this.filters.push(filter);
    });
  
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }
  
    this.audioDestination = this.audioContext.destination;
    this.filters[this.filters.length - 1].connect(this.audioDestination);
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

    console.log('Updated bands positions:', this.bands.map(b => `(${b.x}, ${b.y})`));
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

    console.log(`Mouse coordinates: (${mouseX}, ${mouseY})`);
    console.log('Bands coordinates:', this.bands.map(band => `(${band.x}, ${band.y})`));

    this.dragging = this.bands.find((band) => {
      const distance = Math.hypot(band.x - mouseX, band.y - mouseY);
      console.log(`Distance to band ${band.id}: ${distance}`);
      return distance <= 20; // Testez avec une tolérance plus élevée
    });
    


    if (this.dragging) {
      console.log(`Dragging band: ${this.dragging.id}`);
    } else {
      console.log('No band selected');
    }
  }


  onDrag(e) {
    if (!this.dragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    this.dragging.y = Math.min(
      Math.max(mouseY, 0), // Limite supérieure
      this.canvas.height // Limite inférieure
    );

    // Mettre à jour le gain basé sur la position Y
    const gain = Math.round(((this.canvas.height / 2 - this.dragging.y) / (this.canvas.height / 2)) * 12);
    this.dragging.gain = gain;

    // Mettre à jour le filtre audio
    this.filters[this.dragging.id].gain.value = gain;

    // Synchroniser le slider
    const slider = this.shadowRoot.querySelector(`#slider-${this.dragging.id}`);
    slider.value = gain;

    this.drawGraph();
  }


  stopDragging() {
    this.dragging = null;
  }

  updateSliderGain(index, gain) {
    const band = this.bands[index];
    band.gain = gain;
    band.y = this.canvas.height / 2 - (gain / 12) * (this.canvas.height / 2);
    this.filters[index].gain.value = gain;
  
    // Synchroniser le slider
    const slider = this.shadowRoot.querySelector(`#slider-${index}`);
    slider.value = gain;
  
    this.drawGraph();
  }

  connectAudioSource(audioElement) {
    if (!this.audioSource) {
      this.audioSource = this.audioContext.createMediaElementSource(audioElement);
      this.audioSource.connect(this.filters[0]);
    }
  }
}

customElements.define('audio-equalizer', AudioEqualizer);
