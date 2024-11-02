const template = document.createElement('template');

const getBaseURL = () => {
    const url = new URL('.', import.meta.url);
    return url;
};

async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    const response = await fetch(htmlUrl);
    return response.text();
}

/**
 * Charger le template du composant
 */
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
        this.addTextElement('Modifiez moi'); // Ajout du texte de base par défaut
    }

    initElements() {
        this.logoDisplay = this.shadowRoot.querySelector('.logo-wrapper'); // Conteneur principal du logo
        this.logoBackground = this.shadowRoot.querySelector('.logo-background'); // Fond du logo
        this.logoTexts = this.shadowRoot.querySelector('.logo-texts'); // Textes du logo
        this.backgroundUrlInput = this.shadowRoot.querySelector('#backgroundUrl'); // URL de l'image de fond
        this.backgroundFileInput = this.shadowRoot.querySelector('#backgroundFile'); // Fichier d'image de fond
        this.backgroundSizeInput = this.shadowRoot.querySelector('#backgroundSize'); // Taille de l'image de fond
        this.backgroundEffectInput = this.shadowRoot.querySelector('#backgroundEffect'); // Effet de fond
        this.textSettingsContainer = this.shadowRoot.querySelector('#text-settings-container'); // Conteneur pour les paramètres du texte
        this.addTextButton = this.shadowRoot.querySelector('#addTextButton'); // Bouton pour ajouter un texte
        this.iconFileInput = this.shadowRoot.querySelector('#iconFile'); // Fichier d'icône
    }

    /** Fonction pour faire les appels d'actions lors de l'attachement des listeners
     */
    attachEventListeners() {
        this.backgroundUrlInput.addEventListener('input', () => this.updateBackground());
        this.backgroundFileInput.addEventListener('change', (e) => this.updateBackgroundFromFile(e));
        this.backgroundSizeInput.addEventListener('input', () => this.updateBackgroundSize());
        this.backgroundEffectInput.addEventListener('change', () => this.applyBackgroundEffect());
        this.addTextButton.addEventListener('click', () => this.addTextElement());
        this.iconFileInput.addEventListener('change', (e) => this.addIconFromFile(e));

        this.shadowRoot.querySelector('#generateCode').addEventListener('click', () => this.generateCodeFile()); // Add event listener for the 'Generate Code' button

        // Désactiver les icônes lorsqu'on clique en dehors
        this.shadowRoot.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-wrapper')) {
                this.deactivateIcons();
            }
        });
    }

    /**
     * Fonction pour mettre à jour l'image de fond
     */
    updateBackground() {
        const backgroundUrl = this.backgroundUrlInput.value;
        this.logoBackground.style.backgroundImage = `url(${backgroundUrl})`;
    }

    /**
     * Fonction pour mettre à jour l'image de fond depuis un fichier
     */
    updateBackgroundFromFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoBackground.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Fonction pour mettre à jour la taille de l'image de fond
     */
    updateBackgroundSize() {
        const sizePercentage = this.backgroundSizeInput.value;
        this.logoBackground.style.backgroundSize = `${sizePercentage}%`;
    }

    /**
     * Fonction pour appliquer un effet sur l'image de fond
     */
    applyBackgroundEffect() {
        const effect = this.backgroundEffectInput.value;
        this.logoBackground.style.filter = this.getFilterEffect(effect);
    }

    /**
     * Fonction pour obtenir l'équivalent CSS d'un effet de fond
     */
    getFilterEffect(effect) {
        switch (effect) {
            case 'blur': return 'blur(5px)';
            case 'grayscale': return 'grayscale(100%)';
            case 'sepia': return 'sepia(100%)';
            default: return 'none';
        }
    }

    /**
     * Fonction pour ajouter un texte
     */
    addTextElement(defaultText = `Texte ${this.textElements.length + 1}`) {
        const textElement = this.createTextElement(defaultText);
        this.textElements.push(textElement);
        this.logoTexts.appendChild(textElement);
        this.createTextSettingsPanel(defaultText, textElement);
    }

    /**
     * Fonction pour créer un nouvel élément de texte
     */
    createTextElement(text) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.style.color = '#000';
        textElement.style.fontSize = '32px';
        textElement.classList.add('draggable');
        textElement.style.position = 'absolute';
        textElement.style.cursor = 'move';
        textElement.style.left = '50px'; 
        textElement.style.top = '50px';
        this.makeDraggable(textElement);
        return textElement;
    }

    /**
     * Fonction pour rendre un élément draggable
     */
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

    /**
     * Fonction pour créer un panel de paramètres pour un texte
     */
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
            textElement.style.webkitBackgroundClip = 'text';
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

    /**
     * Ajoute une icône depuis un fichier
     * @param {Event} event - L'evenement d'ajout de fichier
     */
    addIconFromFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.addIconElement(e.target.result); // Utilise l'image comme source
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Ajoute une icône depuis une URL
     * @param {string} iconUrl - L'URL de l'icône
     */
    addIconElement(iconUrl) {
        const iconElement = this.createIconElement(iconUrl);
        this.logoTexts.appendChild(iconElement);

        // Créer un panneau de configuration pour cette icône
        this.createIconSettingsPanel(iconUrl, iconElement);
    }

    /**
     * Création d'une icône depuis une URL
     * @param {string} iconUrl - L'URL de l'icône
     * @return {HTMLElement} L'icône
     * */
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

    /**
     * Création d'un panneau de configuration pour une icône
     * @param {string} iconUrl - L'URL de l'icône
     * @param {HTMLElement} iconElement - L'icône
     */
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
        deleteButton.style.marginTop = '10px'; 

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
     * @param {HTMLElement} iconWrapper - L'icône
     * */
    activateIcon(iconWrapper) {
        // Désactiver les autres icônes en enlevant leur classe 'active'
        const activeIcons = this.shadowRoot.querySelectorAll('.icon-wrapper.active');
        activeIcons.forEach(icon => icon.classList.remove('active'));

        // Activer cette icône
        iconWrapper.classList.add('active');
    }

    /**
     * Désactiver toutes les icônes en enlevant leur classe 'active'
     * */
    deactivateIcons() {
        const activeIcons = this.shadowRoot.querySelectorAll('.icon-wrapper.active');
        activeIcons.forEach(icon => icon.classList.remove('active'));
    }

    /**
     * Ajouter la fonctionnalité de redimensionnement à l'icône
     * @param {HTMLElement} iconWrapper - L'icône
     * @param {HTMLElement} resizers - Les poignères de redimensionnement
     * */
    addResizeFunctionality(iconWrapper, resizers) {
        const resizersElements = resizers.querySelectorAll('.resizer');
        let currentResizer;

        let startX, startY, startWidth, startHeight;

        /** Fonction pour activer le redimensionnement de l'icône */
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

        /** Fonction pour redimensionner l'icône */
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

    /** Fonction pour générer le code HTML et le CSS pour le logo généré
     * ACTUELLEMENT KO PCK ON IMAGE PAS OK, ANIM PAS OK
     */
    generateCodeFile() {
        let htmlContent = `<!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Logo Généré</title>
            <style>
                body {
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    background-color: #f0f0f0;
                }
                .logo-wrapper {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                }
                .logo-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: ${this.backgroundSizeInput.value}%;
                    filter: ${this.getFilterEffect(this.backgroundEffectInput.value)};
                    background-image: url(${this.logoBackground.style.backgroundImage.slice(5, -2)});
                }
                .logo-texts div {
                    position: absolute;
                    white-space: pre;
                }
                .icon-wrapper {
                    position: absolute;
                }
                .icon-wrapper img {
                    display: block;
                }
            </style>
        </head>
        <body>
            <div class="logo-wrapper">
                <div class="logo-background"></div>
                <div class="logo-texts">
        `;

        this.textElements.forEach((textElement) => {
            htmlContent += `            <div style="
                    left: ${textElement.style.left};
                    top: ${textElement.style.top};
                    font-size: ${textElement.style.fontSize};
                    background-image: ${textElement.style.backgroundImage};
                    -webkit-background-clip: ${textElement.style.webkitBackgroundClip};
                    background-clip: ${textElement.style.backgroundClip};
                    color: ${textElement.style.color};
                    text-shadow: ${textElement.style.textShadow};
                    writing-mode: ${textElement.style.writingMode};
                    transform: ${textElement.style.transform};
                    animation: ${textElement.style.animation};
                ">${textElement.textContent}</div>
            `;
        });

        const iconWrappers = this.shadowRoot.querySelectorAll('.icon-wrapper');
        iconWrappers.forEach((iconWrapper) => {
            const imgElement = iconWrapper.querySelector('img');
            htmlContent += `<div class="icon-wrapper" style="
                    left: ${iconWrapper.style.left};
                    top: ${iconWrapper.style.top};
                    width: ${iconWrapper.style.width};
                    height: ${iconWrapper.style.height};
                    transform: ${iconWrapper.style.transform};
                    animation: ${iconWrapper.style.animation};">
                    <img src="${imgElement.src}" style="
                        width: 100%;
                        height: 100%;
                    ">
                </div>
            `;
        });

        htmlContent += `</div>
                        </div>
                        </body>
                    </html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'logo_genere.html';
        link.click();
    }
}

customElements.define('logo-generator', LogoGenerator); // Declarer le composant