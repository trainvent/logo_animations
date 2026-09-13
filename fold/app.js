const canvas = document.querySelector("#fold-canvas");
const logoArt = document.querySelector("#logo-art");
const logoFold = document.querySelector("#logo-fold");
const route = document.querySelector("#fold-route");
const linePulse = document.querySelector("#line-pulse");
const foldPoint = document.querySelector("#fold-point");
const revealCircle = document.querySelector("#reveal-circle");
const progress = document.querySelector("#progress");
const state = document.querySelector("#state");
const foldButton = document.querySelector("#fold");
const resetButton = document.querySelector("#reset");
const color = document.querySelector("#color");
const routeLength = route.getTotalLength();
const baseTransform = "translate(480 142) scale(.42)";

route.style.strokeDasharray = routeLength;
route.style.strokeDashoffset = routeLength;
gsap.set(logoFold, { transformOrigin: "450px 900px", scaleY: 0 });
gsap.set(logoArt, { opacity: 1 });
gsap.set(revealCircle, { attr: { r: 0 } });
gsap.set(foldPoint, { opacity: 0 });

function reset() {
  gsap.killTweensOf([logoArt, route, linePulse, foldPoint]);
  route.style.strokeDashoffset = routeLength;
  linePulse.style.strokeDashoffset = 380;
  logoArt.setAttribute("transform", baseTransform);
  gsap.set(logoFold, { scaleY: 0 });
  gsap.set(logoArt, { opacity: 1 });
  gsap.set(revealCircle, { attr: { r: 0 } });
  gsap.set(foldPoint, { opacity: 0 });
  progress.style.width = "0%";
  state.textContent = "READY";
}

function fold() {
  reset();
  state.textContent = "FOLDING";
  gsap.timeline({ onComplete: () => { state.textContent = "COMPLETE"; gsap.set(foldPoint, { opacity: 0 }); } })
    .to(linePulse, { strokeDashoffset: 0, duration: .65, ease: "power2.inOut" })
    .to(foldPoint, { opacity: 1, duration: .12 }, "<.42")
    .to(logoFold, { scaleY: 1, duration: 1.35, ease: "power3.out" })
    .to(revealCircle, { attr: { r: 285 }, duration: 1.35, ease: "power2.out" }, "<")
    .to(route, { strokeDashoffset: 0, duration: 5.5, ease: "none", onUpdate: () => { progress.style.width = `${(1 - Number(route.style.strokeDashoffset) / routeLength) * 100}%`; } }, "<.1")
    .to(foldPoint, { scale: 1.25, opacity: 0, duration: .4 }, "-=.4");
}

foldButton.addEventListener("click", fold);
resetButton.addEventListener("click", reset);
color.addEventListener("input", () => {
  canvas.style.setProperty("--accent", color.value);
});

gsap.fromTo("header, .fold-stage", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: "power2.out" });
