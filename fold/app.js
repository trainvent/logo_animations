const canvas = document.querySelector("#fold-canvas");
const route = document.querySelector("#fold-route");
const linePulse = document.querySelector("#line-pulse");
const lineShadow = document.querySelector("#line-shadow");
const progress = document.querySelector("#progress");
const state = document.querySelector("#state");
const foldButton = document.querySelector("#fold");
const resetButton = document.querySelector("#reset");
const color = document.querySelector("#color");
const routeLength = route.getTotalLength();
const pointCount = 260;
const logoScale = .32;
const anchor = { x: 729, y: 520 };
const lineLength = routeLength * logoScale;
const coilPointCount = 220;
const straightPointCount = pointCount - coilPointCount + 1;
const coilCenter = { x: 330, y: 290 };
const coilRadius = { x: 260, y: 230 };
const coilFeedStart = { x: coilCenter.x, y: anchor.y };
const coilEndAngle = Math.atan2((coilFeedStart.y - coilCenter.y) / coilRadius.y, (coilFeedStart.x - coilCenter.x) / coilRadius.x);
const coilTurns = 2.1;
function spiralPoint(progress) {
  const radius = .08 + (.92 * (1 - (1 - progress) ** 3));
  const angle = coilEndAngle + (Math.PI * 2 * coilTurns * (1 - progress));
  return {
    x: coilCenter.x + (coilRadius.x * radius * Math.cos(angle)),
    y: coilCenter.y + (coilRadius.y * radius * Math.sin(angle)),
  };
}

const coilPoints = Array.from({ length: coilPointCount }, (_, index) => spiralPoint(index / (coilPointCount - 1)));
const straightPoints = Array.from({ length: straightPointCount }, (_, index) => ({
  x: coilFeedStart.x + ((anchor.x - coilFeedStart.x) * index) / (straightPointCount - 1),
  y: anchor.y,
}));
straightPoints.splice(0, 1, ...coilPoints);
const shapedPoints = Array.from({ length: pointCount }, (_, index) => {
  const source = route.getPointAtLength(routeLength * (1 - index / (pointCount - 1)));
  return {
    x: anchor.x + (source.x - 450) * logoScale,
    y: anchor.y - (source.y - 9.45) * logoScale,
  };
});
const motion = { progress: 0 };

document.querySelector("#logo-art").remove();

function pathFor(points) {
  return points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
}

function updateMotion() {
  const value = motion.progress;
  const points = straightPoints.map((point, index) => {
    const feedProgress = Math.max(0, Math.min(1, (value - (pointCount - 1 - index) / pointCount) * pointCount));
    return {
      x: point.x + (shapedPoints[index].x - point.x) * feedProgress,
      y: point.y + (shapedPoints[index].y - point.y) * feedProgress,
    };
  });
  const path = pathFor(points);
  linePulse.setAttribute("d", path);
  lineShadow.setAttribute("d", path);
  progress.style.width = `${value * 100}%`;
}

function reset() {
  gsap.killTweensOf(motion);
  motion.progress = 0;
  updateMotion();
  state.textContent = "READY";
}

function fold() {
  reset();
  state.textContent = "FOLDING";
  gsap.to(motion, { progress: 1, duration: 6.2, ease: "none", onUpdate: updateMotion, onComplete: () => { state.textContent = "COMPLETE"; } });
}

reset();
foldButton.addEventListener("click", fold);
resetButton.addEventListener("click", reset);
color.addEventListener("input", () => {
  canvas.style.setProperty("--accent", color.value);
});

gsap.fromTo("header, .fold-stage", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: "power2.out" });
