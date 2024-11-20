const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Liste des bandes avec les fréquences initiales
const bands = [
  { freq: 63, gain: 0, x: 100, y: canvas.height / 2 },
  { freq: 136, gain: 0, x: 200, y: canvas.height / 2 },
  { freq: 294, gain: 0, x: 300, y: canvas.height / 2 },
  { freq: 632, gain: 0, x: 400, y: canvas.height / 2 },
  { freq: 1363, gain: 0, x: 500, y: canvas.height / 2 },
  { freq: 2936, gain: 0, x: 600, y: canvas.height / 2 },
  { freq: 6324, gain: 0, x: 700, y: canvas.height / 2 },
];

// Dessiner le graphe
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  for (let i = 0; i <= canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= canvas.height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Points interactifs
  bands.forEach((band) => {
    ctx.beginPath();
    ctx.arc(band.x, band.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5500';
    ctx.fill();
    ctx.stroke();
  });
}

let dragging = null;

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
  dragging.x = e.clientX - rect.left;
  dragging.y = e.clientY - rect.top;
  drawGraph();
});

canvas.addEventListener('mouseup', () => {
  dragging = null;
});

// Dessiner au démarrage
drawGraph();
