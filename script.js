// Canvas setup
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Liste des bandes avec leurs couleurs
const bands = [
  { id: 0, freq: 63, gain: 0, color: '#9b5de5' }, // Violet
  { id: 1, freq: 136, gain: 0, color: '#f15bb5' }, // Rose
  { id: 2, freq: 294, gain: 0, color: '#fee440' }, // Jaune
  { id: 3, freq: 632, gain: 0, color: '#00bbf9' }, // Bleu clair
  { id: 4, freq: 1363, gain: 0, color: '#00f5d4' }, // Vert menthe
  { id: 5, freq: 2936, gain: 0, color: '#ff5f57' }, // Rouge
  { id: 6, freq: 6324, gain: 0, color: '#56b4d3' }, // Bleu arcane
];

// Répartir les points horizontalement
const distributePoints = () => {
  const step = canvas.width / (bands.length + 1); // Espacement
  bands.forEach((band, index) => {
    band.x = step * (index + 1);
    band.y = canvas.height / 2; // Initialement au centre
  });
};

// Dessiner le cadrillage
const drawGrid = () => {
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  // Lignes verticales
  const verticalStep = 50; // Espacement des lignes verticales
  for (let x = 0; x < canvas.width; x += verticalStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Lignes horizontales
  const horizontalStep = 50; // Espacement des lignes horizontales
  for (let y = 0; y < canvas.height; y += horizontalStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
};

// Fonction pour dessiner la courbe connectée
const drawGraph = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner le cadrillage
  drawGrid();

  // Dessiner la courbe
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  bands.forEach((band, index) => {
    if (index === 0) {
      ctx.moveTo(band.x, band.y);
    } else {
      const prev = bands[index - 1];
      const cpX = (prev.x + band.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, band.y, band.x, band.y);
    }
  });
  ctx.stroke();

  // Dessiner les boutons avec des couleurs spécifiques
  bands.forEach((band) => {
    ctx.beginPath();
    ctx.arc(band.x, band.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = band.color; // Couleur spécifique
    ctx.fill();
    ctx.stroke();
  });
};

// Événements pour interagir avec les points
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Vérifier si un point est cliqué
  dragging = bands.find(
    (band) => Math.hypot(band.x - mouseX, band.y - mouseY) < 10
  );
});

canvas.addEventListener('mousemove', (e) => {
  if (!dragging) return;

  const rect = canvas.getBoundingClientRect();
  dragging.y = Math.min(
    Math.max(e.clientY - rect.top, 0), // Limite supérieure
    canvas.height // Limite inférieure
  );

  // Synchroniser le slider correspondant
  const slider = document.getElementById(`slider-${dragging.id}`);
  dragging.gain = Math.round(((canvas.height / 2 - dragging.y) / (canvas.height / 2)) * 12);
  slider.value = dragging.gain;

  drawGraph();
});

canvas.addEventListener('mouseup', () => {
  dragging = null;
});

// Synchroniser sliders -> boutons
document.querySelectorAll('.slider').forEach((slider) => {
  slider.addEventListener('input', (e) => {
    const id = parseInt(e.target.id.split('-')[1]);
    const band = bands.find((b) => b.id === id);

    band.gain = parseFloat(e.target.value);
    band.y = canvas.height / 2 - (band.gain / 12) * canvas.height / 2;

    drawGraph();
  });
});

// Initialisation
distributePoints();
drawGraph();
