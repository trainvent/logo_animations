const fuse = document.querySelector("#logo");
const progress = document.querySelector("#progress");
const routeState = document.querySelector("#route-state");
const timeReadout = document.querySelector("#time-readout");
const playButton = document.querySelector("#play");
const pauseButton = document.querySelector("#pause");
const replayButton = document.querySelector("#replay");
const speed = document.querySelector("#speed");
const speedValue = document.querySelector("#speed-value");
const showEmber = document.querySelector("#show-ember");
let animation;
let startedAt = 0;

function formatTime(seconds) {
  return `00:${String(Math.floor(seconds)).padStart(2, "0")}`;
}

function animateRoute(fromStart = false) {
  if (fromStart) fuse.setProgress(0);
  startedAt = performance.now();
  routeState.textContent = "BURNING";
  animation?.kill();
  animation = fuse.animateTo(1, { duration: 14 / Number(speed.value) });
}

fuse.addEventListener("fuse-progress", (event) => {
  const value = event.detail.progress;
  progress.style.width = `${value * 100}%`;
  timeReadout.textContent = formatTime((performance.now() - startedAt) / 1000);
});

fuse.addEventListener("fuse-complete", () => {
  routeState.textContent = "COMPLETE";
});

playButton.addEventListener("click", () => animateRoute(fuse.progressValue === 1));
replayButton.addEventListener("click", () => animateRoute(true));
pauseButton.addEventListener("click", () => {
  if (animation) {
    animation.paused(!animation.paused());
    routeState.textContent = animation.paused() ? "PAUSED" : "BURNING";
  }
});

speed.addEventListener("input", () => {
  speedValue.textContent = `${Number(speed.value).toFixed(2)}×`;
  if (animation) animateRoute(false);
});

showEmber.addEventListener("change", () => {
  if (showEmber.checked) fuse.setAttribute("show-ember", "");
  else fuse.removeAttribute("show-ember");
});

gsap.fromTo(".hero-copy, .route-meta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: "power2.out" });
gsap.set(".stage", { opacity: 0, y: 22 });
gsap.to(".stage", { opacity: 1, y: 0, duration: .8, delay: .18, ease: "power2.out" });
