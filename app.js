const route = document.querySelector("#route");
const pen = document.querySelector("#pen");
const progress = document.querySelector("#progress");
const drawButton = document.querySelector("#draw");
const pauseButton = document.querySelector("#pause");
const resetButton = document.querySelector("#reset");
const speed = document.querySelector("#speed");
const speedValue = document.querySelector("#speed-value");
const logo = document.querySelector("#logo");
const edgePicker = document.querySelector("#edge-picker");
const edgeLabels = document.querySelector("#edge-labels");
const pickButton = document.querySelector("#pick");
const undoPickButton = document.querySelector("#undo-pick");
const clearPicksButton = document.querySelector("#clear-picks");
const pickHelp = document.querySelector("#pick-help");

const points = {
  A: [450, 9.45], B: [831.5275, 670.275], C: [68.4725, 670.275],
  D: [548.3474, 179.7927], E: [634.8327, 670.275], F: [166.8199, 499.9323],
  G: [570.641, 306.2257], H: [514.1917, 626.3653], I: [265.1673, 417.409],
  J: [556.0899, 388.749], K: [450, 572.502], L: [343.9101, 388.749],
};

const edgeDefinitions = [
  ["A", "B", "1"], ["B", "C", "1"], ["C", "A", "1"],
  ["A", "D"], ["D", "B"], ["B", "E"], ["E", "C"], ["C", "F"], ["F", "A"],
  ["D", "G"], ["G", "E"], ["E", "H"], ["H", "F"], ["F", "I"], ["I", "D"],
  ["G", "J"], ["J", "H"], ["H", "K"], ["K", "I"], ["I", "L"], ["L", "G"],
  ["J", "L"], ["L", "K"], ["K", "J"],
];

const defaultEdgeOrder = [
  ["A", "B"], ["B", "C"], ["C", "A"], ["A", "D"], ["D", "B"], ["B", "E"],
  ["E", "C"], ["C", "F"], ["F", "A"], ["D", "G"], ["G", "E"], ["E", "H"],
  ["H", "F"], ["F", "I"], ["I", "D"], ["G", "J"], ["J", "H"], ["H", "K"],
  ["K", "I"], ["I", "L"], ["L", "G"], ["J", "L"], ["L", "K"], ["K", "J"],
];

const pickedEdges = [];
let picking = false;

let animation;
let routeLength = 0;

function edgeKey(start, end) {
  return [start, end].sort().join("");
}

function edgePath(start, end, arc) {
  return `M${points[start][0]} ${points[start][1]} ${edgeCommand(start, end, arc)}`;
}

function edgeCommand(start, end, arc) {
  if (arc) return `A445 445 0 0 ${arc} ${points[end][0]} ${points[end][1]}`;
  return `L${points[end][0]} ${points[end][1]}`;
}

function edgeLabelPoint(start, end, arc) {
  if (arc) {
    const centerX = 450;
    const centerY = 450;
    const radius = 462;
    const startAngle = Math.atan2(points[start][1] - centerY, points[start][0] - centerX);
    const endAngle = Math.atan2(points[end][1] - centerY, points[end][0] - centerX);
    let delta = endAngle - startAngle;
    if (arc === "1") {
      while (delta < 0) delta += Math.PI * 2;
    } else {
      while (delta > 0) delta -= Math.PI * 2;
    }
    const midpointAngle = startAngle + delta / 2;
    return [centerX + Math.cos(midpointAngle) * radius, centerY + Math.sin(midpointAngle) * radius];
  }
  return [(points[start][0] + points[end][0]) / 2, (points[start][1] + points[end][1]) / 2];
}

function createEdgePicker() {
  edgeDefinitions.forEach(([start, end, arc], index) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.dataset.edge = edgeKey(start, end);
    path.dataset.start = start;
    path.dataset.end = end;
    path.dataset.arc = arc || "";
    path.setAttribute("d", edgePath(start, end, arc));
    path.addEventListener("click", () => selectEdge(index));
    edgePicker.appendChild(path);
  });
}

function setPickedRoute(sequence) {
  pickedEdges.length = 0;
  sequence.forEach(([start, end]) => {
    const definition = edgeDefinitions.find(([from, to]) => edgeKey(from, to) === edgeKey(start, end));
    if (!definition) throw new Error(`Unknown route edge: ${start}${end}`);
    pickedEdges.push({
      key: edgeKey(start, end),
      start,
      end,
      arc: start === definition[0] ? definition[2] : reverseArc(definition[2]),
    });
  });
  route.setAttribute("d", routeData());
  configureAnimation();
  renderPickedRoute();
}

function routeData() {
  if (!pickedEdges.length) return "";
  const first = pickedEdges[0];
  return `M${points[first.start][0]} ${points[first.start][1]} ${pickedEdges.map(({ start, end, arc }) => edgeCommand(start, end, arc)).join(" ")}`;
}

function renderPickedRoute() {
  edgeLabels.replaceChildren();
  edgePicker.querySelectorAll("path").forEach((path) => path.classList.toggle("picked", pickedEdges.some((edge) => edge.key === path.dataset.edge)));
  pickedEdges.forEach(({ start, end }, index) => {
    const [x, y] = edgeLabelPoint(start, end, pickedEdges[index].arc);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", y);
    label.textContent = index + 1;
    edgeLabels.appendChild(label);
  });
  undoPickButton.disabled = pickedEdges.length === 0;
  clearPicksButton.disabled = pickedEdges.length === 0;
}

function selectEdge(index) {
  if (!picking) return;
  const [definitionStart, definitionEnd, arc] = edgeDefinitions[index];
  const key = edgeKey(definitionStart, definitionEnd);
  if (pickedEdges.some((edge) => edge.key === key)) {
    pickHelp.textContent = "That segment is already numbered. Choose an unused segment.";
    return;
  }
  let start = definitionStart;
  let end = definitionEnd;
  if (pickedEdges.length) {
    const current = pickedEdges[pickedEdges.length - 1].end;
    if (definitionStart === current) {
      start = definitionStart;
      end = definitionEnd;
    } else if (definitionEnd === current) {
      start = definitionEnd;
      end = definitionStart;
    } else {
      pickHelp.textContent = `Continue from point ${current}; that segment is disconnected.`;
      return;
    }
  }
  pickedEdges.push({ key, start, end, arc: start === definitionStart ? arc : reverseArc(arc) });
  route.setAttribute("d", routeData());
  configureAnimation();
  renderPickedRoute();
  pickHelp.textContent = pickedEdges.length === edgeDefinitions.length
    ? "Complete route. Press Draw to animate it."
    : `Segment ${pickedEdges.length} selected. Continue from point ${end}.`;
}

function reverseArc(arc) {
  if (!arc) return "";
  return arc === "1" ? "0" : "1";
}

function configureAnimation() {
  animation?.kill();
  routeLength = route.getTotalLength();
  gsap.set(route, { opacity: 0, strokeDasharray: routeLength, strokeDashoffset: routeLength });
  gsap.set(pen, { opacity: 0 });
  animation = gsap.to(route, {
    strokeDashoffset: 0,
    duration: 12,
    ease: "none",
    paused: true,
    onStart: () => gsap.set([route, pen], { opacity: 1 }),
    onUpdate: () => {
      const distance = routeLength * animation.progress();
      const point = route.getPointAtLength(distance);
      gsap.set(pen, { attr: { cx: point.x, cy: point.y } });
      progress.style.width = `${animation.progress() * 100}%`;
    },
    onComplete: () => gsap.set(pen, { opacity: 0 }),
  });
}

configureAnimation();
createEdgePicker();
setPickedRoute(defaultEdgeOrder);

drawButton.addEventListener("click", () => {
  if (animation.progress() === 1) animation.restart();
  else animation.play();
});

pauseButton.addEventListener("click", () => animation.paused(!animation.paused()));

resetButton.addEventListener("click", () => {
  animation.pause(0);
  gsap.set([route, pen], { opacity: 0 });
  progress.style.width = "0%";
});

speed.addEventListener("input", (event) => {
  const multiplier = Number(event.target.value);
  animation.timeScale(multiplier);
  speedValue.textContent = `${multiplier.toFixed(2)}×`;
});

pickButton.addEventListener("click", () => {
  picking = !picking;
  pickButton.classList.toggle("primary", picking);
  pickHelp.textContent = picking
    ? (pickedEdges.length ? `Continue from point ${pickedEdges[pickedEdges.length - 1].end}.` : "Choose any first segment.")
    : "Press Pick path segments to continue numbering.";
});

undoPickButton.addEventListener("click", () => {
  pickedEdges.pop();
  route.setAttribute("d", routeData());
  configureAnimation();
  renderPickedRoute();
});

clearPicksButton.addEventListener("click", () => {
  pickedEdges.length = 0;
  route.setAttribute("d", "");
  configureAnimation();
  renderPickedRoute();
  pickHelp.textContent = "Choose any first segment.";
});
