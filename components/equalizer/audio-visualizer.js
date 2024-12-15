const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('./', import.meta.url).href;
};

// Template HTML pour l'égaliseur
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'audio-visualizer.css'}">
    <h3>Visualiseur audio</h3>
`;

class AudioVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        

    }

    connectedCallback() {
        
    }

}

customElements.define('audio-visualizer', AudioVisualizer);
