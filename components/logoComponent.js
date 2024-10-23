const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    const response = await fetch(htmlUrl);
    return response.text();
}

const loadTemplate = async () => {
    const templateHTML = await loadHTML('./logoComponent.html', getBaseURL());
    template.innerHTML = `
        <link rel="stylesheet" href="${getBaseURL() + 'logoComponent.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'grid.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'settings.css'}">
        <link rel="stylesheet" href="${getBaseURL() + 'text.css'}">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet">
        ${templateHTML}
    `;
};

// Charger le template avant d'initialiser le composant
await loadTemplate();

export class LogoGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.textElements = []; // Liste des textes ajoutés
        this._backgroundImage = ''; // URL ou fichier d'image de fond
    }

    async connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.initElements();
        this.attachEventListeners();
        this.addTextElement('Modifier moi'); // Ajout du texte de base par défaut
    }

    initElements() {
        this.logoDisplay = this.shadowRoot.querySelector('.logo-wrapper');
        this.logoBackground = this.shadowRoot.querySelector('.logo-background');
        this.logoTexts = this.shadowRoot.querySelector('.logo-texts');
        this.backgroundUrlInput = this.shadowRoot.querySelector('#backgroundUrl');
        this.backgroundFileInput = this.shadowRoot.querySelector('#backgroundFile');
        this.backgroundSizeInput = this.shadowRoot.querySelector('#backgroundSize');
        this.backgroundEffectInput = this.shadowRoot.querySelector('#backgroundEffect');
        this.textSettingsContainer = this.shadowRoot.querySelector('#text-settings-container');
        this.addTextButton = this.shadowRoot.querySelector('#addTextButton');
    }

    attachEventListeners() {
        this.backgroundUrlInput.addEventListener('input', () => this.updateBackground());
        this.backgroundFileInput.addEventListener('change', (e) => this.updateBackgroundFromFile(e));
        this.backgroundSizeInput.addEventListener('input', () => this.updateBackgroundSize());
        this.backgroundEffectInput.addEventListener('change', () => this.applyBackgroundEffect());
        this.addTextButton.addEventListener('click', () => this.addTextElement());

        // Pour générer le logo
        const generateLogoButton = this.shadowRoot.querySelector('#generateLogo');
        generateLogoButton.addEventListener('click', () => this.captureAndDownloadLogo());
    }

    updateBackground() {
        const backgroundUrl = this.backgroundUrlInput.value;
        this.logoBackground.style.backgroundImage = `url(${backgroundUrl})`;
    }

    updateBackgroundFromFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoBackground.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
    }

    updateBackgroundSize() {
        const sizePercentage = this.backgroundSizeInput.value;
        this.logoBackground.style.backgroundSize = `${sizePercentage}%`;
    }

    applyBackgroundEffect() {
        const effect = this.backgroundEffectInput.value;
        this.logoBackground.style.filter = this.getFilterEffect(effect);
    }

    getFilterEffect(effect) {
        switch (effect) {
            case 'blur': return 'blur(5px)';
            case 'grayscale': return 'grayscale(100%)';
            case 'sepia': return 'sepia(100%)';
            default: return 'none';
        }
    }

    addTextElement(defaultText = `Texte ${this.textElements.length + 1}`) {
        const textElement = this.createTextElement(defaultText);
        this.textElements.push(textElement);
        this.logoTexts.appendChild(textElement);

        // Créer un panneau de paramètres pour ce texte
        this.createTextSettingsPanel(defaultText, textElement);
    }

    createTextElement(text) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.style.color = '#000';
        textElement.style.fontSize = '32px';
        textElement.classList.add('draggable');
        textElement.style.position = 'absolute';
        textElement.style.cursor = 'move';
        textElement.style.left = '50px'; // Position initiale par défaut
        textElement.style.top = '50px';  // Position initiale par défaut
        this.makeDraggable(textElement); // Ajoute la capacité de déplacement par drag
        return textElement;
    }

    makeDraggable(element) {
        let offsetX = 0, offsetY = 0, isDragging = false;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const parent = this.logoDisplay.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();

                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Calculer les limites
                const minX = 0;
                const minY = 0;
                const maxX = parent.width - elementRect.width;
                const maxY = parent.height - elementRect.height;

                // Restreindre les déplacements aux bords du parent
                if (newX < minX) newX = minX;
                if (newY < minY) newY = minY;
                if (newX > maxX) newX = maxX;
                if (newY > maxY) newY = maxY;

                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    createTextSettingsPanel(text, textElement) {
        const panel = document.createElement('div');
        panel.classList.add('text-settings-panel');
        panel.innerHTML = `
            <h4>Paramètres pour ${text}</h4>
            <label>Texte: <input type="text" value="${text}" /></label>
            <label>Couleur: <input type="color" value="#000000" /></label>
            <label>Taille: <input type="range" min="16" max="72" value="32" /></label>
            <label>Orientation:
                <select class="orientation-select">
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical-column">Vertical (lettres les unes sous les autres)</option>
                    <option value="vertical-side">Vertical (sur les côtés)</option>
                </select>
            </label>
            <label>Animation:
                <select class="animation-select">
                    <option value="none">Aucune</option>
                    <option value="rotate">Rotation</option>
                    <option value="fade-in">Apparition</option>
                    <option value="bounce">Sautillant</option>
                </select>
            </label>
        `;

        const textInput = panel.querySelector('input[type="text"]');
        const colorInput = panel.querySelector('input[type="color"]');
        const fontSizeInput = panel.querySelector('input[type="range"]');
        const orientationSelect = panel.querySelector('.orientation-select'); // Spécifie la classe pour l'orientation
        const animationSelect = panel.querySelector('.animation-select'); // Spécifie la classe pour l'animation

        // Modification du texte
        textInput.addEventListener('input', () => {
            textElement.textContent = textInput.value;
        });

        // Changement de couleur
        colorInput.addEventListener('input', () => {
            textElement.style.color = colorInput.value;
        });

        // Taille de police
        fontSizeInput.addEventListener('input', () => {
            textElement.style.fontSize = `${fontSizeInput.value}px`;
        });

        // Orientation du texte
        orientationSelect.addEventListener('change', () => {
            const orientation = orientationSelect.value;
            if (orientation === 'vertical-column') {
                textElement.style.writingMode = 'vertical-rl';
                textElement.style.textOrientation = 'upright';
            } else if (orientation === 'vertical-side') {
                textElement.style.transform = 'rotate(-90deg)';
            } else {
                textElement.style.writingMode = 'initial';
                textElement.style.transform = 'initial';
            }
        });

        // Application des animations
        animationSelect.addEventListener('change', () => {
            const animation = animationSelect.value;
            textElement.classList.remove('rotate', 'fade-in', 'bounce'); // Supprime les anciennes classes d'animation
            if (animation !== 'none') {
                textElement.classList.add(animation); // Ajoute la nouvelle classe d'animation
            }
        });

        this.textSettingsContainer.appendChild(panel);
    }

    // Capture du logo et téléchargement
    captureAndDownloadLogo() {
        const logoContainer = this.shadowRoot.querySelector('.logo-wrapper');

        html2canvas(logoContainer).then(canvas => {
            canvas.toBlob(blob => {
                saveAs(blob, 'logo.png');
            });
        });
    }
}

customElements.define('logo-generator', LogoGenerator);
