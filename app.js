const route = document.querySelector("#route");
const pen = document.querySelector("#pen");
const progress = document.querySelector("#progress");
const drawButton = document.querySelector("#draw");
const pauseButton = document.querySelector("#pause");
const resetButton = document.querySelector("#reset");
const speed = document.querySelector("#speed");
const speedValue = document.querySelector("#speed-value");

const routeLength = route.getTotalLength();
gsap.set(route, { opacity: 0, strokeDasharray: routeLength, strokeDashoffset: routeLength });
gsap.set(pen, { opacity: 0 });

const animation = gsap.to(route, {
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
