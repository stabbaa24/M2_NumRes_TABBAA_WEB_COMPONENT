const template = document.createElement('template');

const getBaseURL = () => {
    console.log('import.meta.url:', import.meta.url);
    const url = new URL('.', import.meta.url);
    console.log('getBaseURL:', url.href);
    return url;
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

        this.iconCount = 0; // Compteur pour suivre le nombre d'icônes ajoutées
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
        this.iconFileInput = this.shadowRoot.querySelector('#iconFile');
        this.shadowRoot.querySelector('#generateLogo').addEventListener('click', () => this.generateLogoImage());
    }

    attachEventListeners() {
        this.backgroundUrlInput.addEventListener('input', () => this.updateBackground());
        this.backgroundFileInput.addEventListener('change', (e) => this.updateBackgroundFromFile(e));
        this.backgroundSizeInput.addEventListener('input', () => this.updateBackgroundSize());
        this.backgroundEffectInput.addEventListener('change', () => this.applyBackgroundEffect());
        this.addTextButton.addEventListener('click', () => this.addTextElement());
        this.iconFileInput.addEventListener('change', (e) => this.addIconFromFile(e));

        // Désactiver les icônes lorsqu'on clique en dehors
        this.shadowRoot.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-wrapper')) {
                this.deactivateIcons();
            }
        });
    }

    generateLogoImage() {
        const canvas = document.getElementById('logoCanvas');
        const ctx = canvas.getContext('2d');

        // Obtenez les dimensions du logo pour ajuster la taille du canvas
        const logoWrapper = this.logoDisplay.getBoundingClientRect();
        canvas.width = logoWrapper.width;
        canvas.height = logoWrapper.height;

        // Initialiser une promesse pour charger l'image de fond
        let backgroundPromise = Promise.resolve();

        // Vérifier si une image de fond est présente
        if (this.logoBackground.style.backgroundImage) {
            const backgroundUrl = this.logoBackground.style.backgroundImage.slice(5, -2); // Enlever "url(...)" des styles
            const backgroundImg = new Image();
            backgroundPromise = new Promise((resolve) => {
                backgroundImg.onload = () => {
                    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                backgroundImg.src = backgroundUrl;
            });
        }

        // Quand l'image de fond est chargée, dessiner les textes
        backgroundPromise.then(() => {
            this.textElements.forEach(textElement => {
                const style = window.getComputedStyle(textElement);
                ctx.font = `${style.fontSize} ${style.fontFamily}`;
                ctx.fillStyle = style.color;
                const left = parseInt(style.left, 10);
                const top = parseInt(style.top, 10);
                ctx.fillText(textElement.textContent, left, top);
            });

            // Générer l'URL de l'image PNG
            const imageUrl = canvas.toDataURL('image/png');

            // Créer un lien pour télécharger l'image
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'logo.png';
            link.click();
        });
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
    
            <div class="gradient-color-container">
                <label>Couleur de départ:</label>
                <input type="color" class="gradient-color-start" value="#000000" />
            </div>
    
            <div class="gradient-color-container">
                <label>Couleur de fin:</label>
                <input type="color" class="gradient-color-end" value="#ff0000" />
            </div>
    
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
                    <option value="bounce">Sautillant</option>
                    <option value="wobble">Wobble</option>
                    <option value="jello">Jello</option>
                    <option value="pulse">Pulsation</option>
                    <option value="tada">Tada</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="zoom-out">Zoom Out</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="shake">Shake</option>
                </select>
            </label>
    
            <!-- Ombre portée -->
            <div class="shadow-section effect-container">
                <label><input type="checkbox" class="enable-shadow" /> Activer l'ombre portée</label>
                <label>Ombre portée (taille et distance): <input type="range" min="0" max="20" value="0" class="shadow-size" disabled /></label>
                <label>Couleur de l'ombre: <input type="color" class="shadow-color" value="#000000" disabled /></label>
            </div>

            <!-- Effet de lumière -->
            <div class="light-section effect-container">
                <label><input type="checkbox" class="enable-light" /> Activer l'effet de lumière</label>
                <label>Effet lumière (taille): <input type="range" min="0" max="20" value="0" class="light-size" disabled /></label>
                <label>Couleur de la lumière: <input type="color" class="light-color" value="#ffffff" disabled /></label>
            </div>
        `;
    
        const textInput = panel.querySelector('input[type="text"]');
        const gradientStartColorInput = panel.querySelector('.gradient-color-start');
        const gradientEndColorInput = panel.querySelector('.gradient-color-end');
        const fontSizeInput = panel.querySelector('input[type="range"]');
        const orientationSelect = panel.querySelector('.orientation-select');
        const animationSelect = panel.querySelector('.animation-select');
        const enableShadowCheckbox = panel.querySelector('.enable-shadow');
        const shadowSizeInput = panel.querySelector('.shadow-size');
        const shadowColorInput = panel.querySelector('.shadow-color');
        const enableLightCheckbox = panel.querySelector('.enable-light');
        const lightSizeInput = panel.querySelector('.light-size');
        const lightColorInput = panel.querySelector('.light-color');
    
        const h4 = panel.querySelector('h4');
        h4.textContent = "Paramètres pour " + textInput.value;
    
        // Modification du texte dynamique
        textInput.addEventListener('input', () => {
            textElement.textContent = textInput.value;
            h4.textContent = "Paramètres pour " + textInput.value;
        });
    
        // Mise à jour du dégradé de couleur
        const applyGradient = () => {
            const startColor = gradientStartColorInput.value;
            const endColor = gradientEndColorInput.value;
    
            textElement.style.backgroundImage = `linear-gradient(to right, ${startColor}, ${endColor})`;
            textElement.style.webkitBackgroundClip = 'text'; // Compatibilité avec Webkit (Chrome, Safari)
            textElement.style.backgroundClip = 'text';
            textElement.style.color = 'transparent'; // Masque la couleur initiale pour ne montrer que le dégradé
        };
    
        gradientStartColorInput.addEventListener('input', applyGradient);
        gradientEndColorInput.addEventListener('input', applyGradient);
    
        applyGradient(); // Appliquer immédiatement le dégradé après avoir sélectionné les couleurs
    
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
            textElement.classList.remove('rotate', 'bounce', 'wobble', 'jello', 'pulse', 'tada', 'zoom-in', 'zoom-out', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'shake');
    
            const animation = animationSelect.value;
            if (animation !== 'none') {
                textElement.classList.add(animation);
            }
        });
    
        // Fonction pour appliquer les effets d'ombre et de lumière
        const applyShadowAndLight = () => {
            let shadow = '';
            let light = '';
        
            // Si l'ombre est activée, ajoutez l'ombre
            if (enableShadowCheckbox.checked) {
                const shadowSize = shadowSizeInput.value;
                const shadowColor = shadowColorInput.value;
                shadow = `${shadowSize}px ${shadowSize}px 5px ${shadowColor}`;
            }
        
            // Si l'effet de lumière est activé, ajoutez la lumière
            if (enableLightCheckbox.checked) {
                const lightSize = lightSizeInput.value;
                const lightColor = lightColorInput.value;
                light = `0 0 ${lightSize}px ${lightColor}`;
            }
        
            // Appliquez les effets combinés
            if (shadow && light) {
                textElement.style.textShadow = `${shadow}, ${light}`; // Applique les deux effets si les deux sont activés
            } else if (shadow) {
                textElement.style.textShadow = shadow; // Applique uniquement l'ombre si la lumière est désactivée
            } else if (light) {
                textElement.style.textShadow = light; // Applique uniquement la lumière si l'ombre est désactivée
            } else {
                textElement.style.textShadow = 'none'; // Réinitialise l'effet si aucun n'est activé
            }
        };
        
        // Activer/Désactiver les contrôles d'ombre portée
        enableShadowCheckbox.addEventListener('change', () => {
            const isEnabled = enableShadowCheckbox.checked;
            shadowSizeInput.disabled = !isEnabled;
            shadowColorInput.disabled = !isEnabled;
            applyShadowAndLight();
        });
        
        // Activer/Désactiver les contrôles d'effet de lumière
        enableLightCheckbox.addEventListener('change', () => {
            const isEnabled = enableLightCheckbox.checked;
            lightSizeInput.disabled = !isEnabled;
            lightColorInput.disabled = !isEnabled;
            applyShadowAndLight();
        });
        
        // Mise à jour de l'ombre et de la lumière
        shadowSizeInput.addEventListener('input', applyShadowAndLight);
        shadowColorInput.addEventListener('input', applyShadowAndLight);
        lightSizeInput.addEventListener('input', applyShadowAndLight);
        lightColorInput.addEventListener('input', applyShadowAndLight);
        
        applyShadowAndLight(); // Appliquez les effets initiaux
    
        // Ajouter un bouton de suppression dans le panneau de paramètres
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️ Supprimer le texte';
        deleteButton.classList.add('delete-button');
        deleteButton.style.marginTop = '10px';
    
        deleteButton.addEventListener('click', () => {
            this.logoTexts.removeChild(textElement);
            this.textElements = this.textElements.filter(el => el !== textElement);
            this.textSettingsContainer.removeChild(panel);
        });
    
        panel.appendChild(deleteButton);
        this.textSettingsContainer.appendChild(panel);
    }
    
    
    addIconFromFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.addIconElement(e.target.result); // Utiliser l'image comme source
            };
            reader.readAsDataURL(file);
        }
    }

    addIconElement(iconUrl) {
        const iconElement = this.createIconElement(iconUrl);
        this.logoTexts.appendChild(iconElement);

        // Créer un panneau de configuration pour cette icône
        this.createIconSettingsPanel(iconUrl, iconElement);
    }

    createIconElement(iconUrl) {
        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('icon-wrapper');
        iconWrapper.style.position = 'absolute';
        iconWrapper.style.left = '100px';
        iconWrapper.style.top = '100px';
        iconWrapper.style.width = '50px';
        iconWrapper.style.height = '50px';
        iconWrapper.style.cursor = 'move';
        iconWrapper.classList.add('draggable');

        const iconElement = document.createElement('img');
        iconElement.src = iconUrl;
        iconElement.style.width = '100%';
        iconElement.style.height = '100%';
        iconElement.style.display = 'block';

        // Ajouter les poignées de redimensionnement
        const resizers = document.createElement('div');
        resizers.classList.add('resizers');
        resizers.innerHTML = `
            <div class="resizer top-left"></div>
            <div class="resizer top-right"></div>
            <div class="resizer bottom-left"></div>
            <div class="resizer bottom-right"></div>
        `;

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(resizers);

        // Permettre le déplacement de l'icône
        this.makeDraggable(iconWrapper);

        // Ajoute la fonctionnalité de redimensionnement
        this.addResizeFunctionality(iconWrapper, resizers);

        // Ajouter un événement 'click' pour activer les poignées
        iconWrapper.addEventListener('click', () => {
            this.activateIcon(iconWrapper);
        });

        return iconWrapper;
    }

    createIconSettingsPanel(iconUrl, iconElement) {
        const panel = document.createElement('div');
        panel.classList.add('icon-settings-panel');

        // Incrémenter le compteur d'icônes
        this.iconCount += 1;

        // Créer le titre du panneau avec le numéro de l'icône
        panel.innerHTML = `
            <h4>Paramètres pour l'icône ${this.iconCount}</h4>
            <label>Taille: <input type="range" min="16" max="128" value="50" /></label>
            <label>Animation:
                <select class="icon-animation-select">
                    <option value="none">Aucune</option>
                    <option value="rotate">Rotation</option>
                    <option value="bounce">Sautillant</option>
                    <option value="wobble">Wobble</option>
                    <option value="jello">Jello</option>
                    <option value="pulse">Pulsation</option>
                    <option value="tada">Tada</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="zoom-out">Zoom Out</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="shake">Shake</option>
                </select>
            </label>
        `;

        const sizeInput = panel.querySelector('input[type="range"]');
        const animationSelect = panel.querySelector('.icon-animation-select');

        // Modification de la taille de l'icône
        sizeInput.addEventListener('input', () => {
            iconElement.style.width = `${sizeInput.value}px`;
            iconElement.style.height = `${sizeInput.value}px`;
        });

        // Application des animations à l'icône
        animationSelect.addEventListener('change', () => {
            const animation = animationSelect.value;
            iconElement.classList.remove('rotate', 'bounce', 'wobble', 'jello', 'pulse', 'tada', 'zoom-in', 'zoom-out', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'shake');
            if (animation !== 'none') {
                iconElement.classList.add(animation); // Ajoute la nouvelle classe d'animation
            }
        });

        // Ajouter un bouton de suppression dans le panneau de paramètres
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️ Supprimer l\'icône';
        deleteButton.classList.add('delete-button');
        deleteButton.style.marginTop = '10px'; // Ajoutez un peu de marge si nécessaire

        // Ajouter l'événement de suppression pour l'icône et son panneau
        deleteButton.addEventListener('click', () => {
            // Supprimer l'icône du DOM
            this.logoTexts.removeChild(iconElement);

            // Supprimer le panneau de paramètres du DOM
            this.textSettingsContainer.removeChild(panel);
        });

        panel.appendChild(deleteButton);

        this.textSettingsContainer.appendChild(panel);
    }

    /**
     * Activer une icône
     * @param {*} iconWrapper L'icône à activer
     */
    activateIcon(iconWrapper) {
        // Désactiver les autres icônes en enlevant leur classe 'active'
        const activeIcons = this.shadowRoot.querySelectorAll('.icon-wrapper.active');
        activeIcons.forEach(icon => icon.classList.remove('active'));

        // Activer cette icône
        iconWrapper.classList.add('active');
    }

    /**
     * Désactiver toutes les icônes
     */
    deactivateIcons() {
        const activeIcons = this.shadowRoot.querySelectorAll('.icon-wrapper.active');
        activeIcons.forEach(icon => icon.classList.remove('active'));
    }

    /**
     * Fonction pour ajouter la fonctionnalité de redimensionnement
     * @param {*} iconWrapper Permet de redimensionner l'icône
     * @param {*} resizers Permet de redimensionner l'icône
     */
    addResizeFunctionality(iconWrapper, resizers) {
        const resizersElements = resizers.querySelectorAll('.resizer');
        let currentResizer;

        let startX, startY, startWidth, startHeight;

        resizersElements.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                currentResizer = resizer;
                startX = e.clientX;
                startY = e.clientY;

                const rect = iconWrapper.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;

                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);

                // Activer les poignées pendant le redimensionnement
                iconWrapper.classList.add('active');
            });
        });

        /**
         * Fonction pour redimensionner l'icône
         * @param {*} e Coordonnées de la souris
         */
        function resize(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (currentResizer.classList.contains('bottom-right')) {
                iconWrapper.style.width = `${startWidth + dx}px`;
                iconWrapper.style.height = `${startHeight + dy}px`;
            } else if (currentResizer.classList.contains('bottom-left')) {
                iconWrapper.style.width = `${startWidth - dx}px`;
                iconWrapper.style.height = `${startHeight + dy}px`;
                iconWrapper.style.left = `${iconWrapper.offsetLeft + dx}px`;
            } else if (currentResizer.classList.contains('top-right')) {
                iconWrapper.style.width = `${startWidth + dx}px`;
                iconWrapper.style.height = `${startHeight - dy}px`;
                iconWrapper.style.top = `${iconWrapper.offsetTop + dy}px`;
            } else if (currentResizer.classList.contains('top-left')) {
                iconWrapper.style.width = `${startWidth - dx}px`;
                iconWrapper.style.height = `${startHeight - dy}px`;
                iconWrapper.style.top = `${iconWrapper.offsetTop + dy}px`;
                iconWrapper.style.left = `${iconWrapper.offsetLeft + dx}px`;
            }
        }

        /**
         * Fonction pour arreter le redimensionnement
         */
        function stopResize() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);

            // Désactiver les poignées après le redimensionnement
            iconWrapper.classList.remove('active');
        }
    }
}

customElements.define('logo-generator', LogoGenerator);