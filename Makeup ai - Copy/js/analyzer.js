import { analyzeBeauty } from "./api.js";
import {
  attachDropzone,
  fileToDataUrl,
  renderImagePreview,
  renderList,
  setStatus,
} from "./utils.js";

const input = document.querySelector("#analyzer-file");
const dropzone = document.querySelector("#analyzer-dropzone");
const previewFigure = document.querySelector("#analyzer-preview");
const previewImage = document.querySelector("#analyzer-preview-image");
const previewCaption = document.querySelector("#analyzer-preview-caption");
const submitButton = document.querySelector("#analyzer-submit");
const status = document.querySelector("#analyzer-status");
const scoreRing = document.querySelector("#score-ring");
const scoreValue = document.querySelector("#score-value");
const summaryTitle = document.querySelector("#analysis-summary-title");
const summary = document.querySelector("#analysis-summary");
const comparisonBanner = document.querySelector("#comparison-banner");
const complimentsList = document.querySelector("#compliments-list");
const tipsList = document.querySelector("#tips-list");

let selectedFile = null;

function animateScore(target) {
  const safeTarget = Math.max(0, Math.min(100, Number(target) || 0));
  const start = Number(scoreValue.textContent) || 0;
  const duration = 900;
  const startedAt = performance.now();

  const step = (time) => {
    const elapsed = time - startedAt;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(start + (safeTarget - start) * eased);

    scoreRing.style.setProperty("--score", current);
    scoreValue.textContent = String(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

function renderAnalysis(result) {
  const score = Math.max(0, Math.min(100, Number(result.score) || 0));
  animateScore(score);
  summaryTitle.textContent = result.title || "Spoorthi's beauty reflection";
  summary.textContent = result.summary;
  comparisonBanner.textContent = result.comparisonStyle;

  renderList(complimentsList, result.compliments, "compliment-chip");

  tipsList.innerHTML = "";
  result.skincareTips.forEach((tip) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.textContent = tip;
    tipsList.appendChild(card);
  });
}

attachDropzone(dropzone, input, (file) => {
  selectedFile = file;
  renderImagePreview({
    file,
    image: previewImage,
    caption: previewCaption,
    previewFigure,
  });
  setStatus(status, "Portrait ready. Launch the beauty profile whenever you are ready.");
});

submitButton.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus(status, "Please choose a portrait before starting the analysis.", "error");
    return;
  }

  try {
    setStatus(status, "Analyzing the portrait with Groq vision...", "");
    submitButton.disabled = true;

    const imageBase64 = await fileToDataUrl(selectedFile);
    const result = await analyzeBeauty(imageBase64);

    renderAnalysis(result);
    setStatus(status, "Beauty analysis complete.", "success");
  } catch (error) {
    setStatus(status, error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});
