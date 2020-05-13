document.oncontextmenu = function() {
  return false;
}

let polys;
let minEdgeCount = 3;
let maxEdgeCount = 8;
let maxRadius;
let minAngle;
let period = 1000;

function setup() {
  let w = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth || 400;
  let h = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight || 400;
  createCanvas(w, h);
  maxRadius = min(w, h) * 0.3;
  minAngle = TAU / maxEdgeCount;
  polys = generatePolys(minEdgeCount, maxEdgeCount, maxRadius);  
}

const polyFromEdgeCount = (n, x, y, radius) => Array.from({length: n}, (_, i) => 
  createVector(x + cos((n - i) * TAU / n) * radius - radius, y + sin((n - i) * TAU / n) * radius)
);

function generatePolys(minEdges, maxEdges, maxRadius) {
  let edgeLen = dist(1, 0, cos(TAU / maxEdges), sin(TAU / maxEdges)) * maxRadius;
  return Array.from({length: maxEdges - minEdges + 1}, (_, i) => {
    let edges = i + minEdges;
    let angle = TAU / edges;
    let radius = edgeLen / sin(angle * 0.5) * 0.5;
    return {
      edges,
      radius,
      angle,
      points: polyFromEdgeCount(edges, 0, 0, radius),
      offset: maxRadius - radius,
      angleDiff: edges === maxEdges ? 0 : (angle - TAU / maxEdges) * 0.5,
    };
  }).reverse();
}

function getColor(pct, c1, c2, c3) {
  if (pct < 0.5) {
    pct *= 2;
    return lerpColor(c1, c2, pct);
  }
  pct = (pct - 0.5) * 2;
  return lerpColor(c2, c3, pct);
}

function draw() {
  background(5, 0, 25);  
  
  let currentPeriodPct = (millis() % period) / period;
  strokeWeight(2);
  stroke(255);
  push();
  translate(width / 2, height / 2);
  rotate(floor(millis() % (period * maxEdgeCount) / period) * minAngle);
  translate(maxRadius, 0);
  for (let poly of polys) {
    push();
    rotate(poly.angleDiff * cos(currentPeriodPct * PI));
    let edgePct = (poly.edges - minEdgeCount) / (maxEdgeCount - minEdgeCount);
    fill(getColor(edgePct, color(0, 160, 255), color(20, 0, 140), color(100, 0, 128)));
    beginShape();
    for (let p of poly.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    // line(poly.points[0].x - poly.radius, 0, poly.points[0].x, poly.points[0].y);
    pop();
  }
  pop();
}
