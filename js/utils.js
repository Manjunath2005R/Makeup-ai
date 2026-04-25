export function setStatus(element, message, tone = "") {
  element.textContent = message;
  element.classList.remove("is-error", "is-success");

  if (tone === "error") {
    element.classList.add("is-error");
  }

  if (tone === "success") {
    element.classList.add("is-success");
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

export function attachDropzone(dropzone, input, onFile) {
  const prevent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ["dragenter", "dragover"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      prevent(event);
      dropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      prevent(event);
      dropzone.classList.remove("is-dragover");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) {
      onFile(file);
    }
  });

  input.addEventListener("change", () => {
    const [file] = input.files;
    if (file) {
      onFile(file);
    }
  });
}

export function renderImagePreview({ file, image, caption, previewFigure }) {
  image.src = URL.createObjectURL(file);
  image.alt = file.name;
  image.hidden = false;
  previewFigure.classList.add("has-image");
  caption.textContent = `${file.name} is ready for a refined preview and API analysis.`;
}

export function renderList(container, items, className) {
  container.innerHTML = "";

  items.forEach((item) => {
    const node = document.createElement("div");
    node.className = className;
    node.textContent = item;
    container.appendChild(node);
  });
}
