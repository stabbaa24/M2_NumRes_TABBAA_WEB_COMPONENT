const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

async function loadHTML(htmlRelativeUrl, baseUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    const response = await fetch(htmlUrl);
    return response.text();
}

const templateHTML = await loadHTML('./logoComponent.html', getBaseURL());

template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'logoComponent.css'}">
    ${templateHTML}
`;

export class LogoGenerator extends HTMLElement {

    constructor() {
        super();
        // on cree un shadow DOM
        this.shadowroot = this.attachShadow({ mode: 'open' });

        // on récupère l'attribut "text" de l'élément
        this.text = this.getAttribute('text');
        this.color = this.getAttribute('color');
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

// on définit le custom element <logo-generator>
customElements.define('logo-generator', LogoGenerator);
