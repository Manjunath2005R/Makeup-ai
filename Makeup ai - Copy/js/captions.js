import { generateCaption } from "./api.js";
import {
  attachDropzone,
  fileToDataUrl,
  renderImagePreview,
  setStatus,
} from "./utils.js";

const input = document.querySelector("#caption-file");
const dropzone = document.querySelector("#caption-dropzone");
const previewFigure = document.querySelector("#caption-preview");
const previewImage = document.querySelector("#caption-preview-image");
const previewCaption = document.querySelector("#caption-preview-caption");
const submitButton = document.querySelector("#caption-submit");
const regenerateButton = document.querySelector("#caption-regenerate");
const status = document.querySelector("#caption-status");
const captionText = document.querySelector("#caption-text");
const captionStyle = document.querySelector("#caption-style");

let selectedFile = null;
let lastCaption = "";

attachDropzone(dropzone, input, (file) => {
  selectedFile = file;
  renderImagePreview({
    file,
    image: previewImage,
    caption: previewCaption,
    previewFigure,
  });
  setStatus(status, "Image ready. Generate a caption whenever you are ready.");
});

async function requestCaption(regenerate = false) {
  if (!selectedFile) {
    setStatus(status, "Please choose an image before generating a caption.", "error");
    return;
  }

  try {
    setStatus(status, regenerate ? "Generating a different caption angle..." : "Generating caption...");
    submitButton.disabled = true;
    regenerateButton.disabled = true;

    const imageBase64 = await fileToDataUrl(selectedFile);
    const data = await generateCaption(imageBase64, regenerate, lastCaption);

    captionText.textContent = data.caption;
    captionStyle.textContent = data.style;
    lastCaption = data.caption;
    setStatus(status, "Caption generated.", "success");
  } catch (error) {
    setStatus(status, error.message, "error");
  } finally {
    submitButton.disabled = false;
    regenerateButton.disabled = false;
  }
}

submitButton.addEventListener("click", () => requestCaption(false));
regenerateButton.addEventListener("click", () => requestCaption(true));
