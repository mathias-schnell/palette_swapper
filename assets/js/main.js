function updateImageScale() {
    const scaleInput = document.querySelector('input[name=scale]');
    const uploadedImage = document.querySelector('img[name=uploadedImage]');
    if (uploadedImage) {
        const originalWidth = uploadedImage.naturalWidth;
        const originalHeight = uploadedImage.naturalHeight;
        const scale = parseFloat(scaleInput.value);
        uploadedImage.style.width = (originalWidth * scale) + 'px';
        uploadedImage.style.height = (originalHeight * scale) + 'px';
    }
}

function adjustScale(delta) {
    const scaleInput = document.querySelector('input[name=scale]');
    let currentScale = parseFloat(scaleInput.value);
    currentScale = Math.max(1.0, Math.min(5.0, currentScale + delta));
    scaleInput.value = currentScale.toFixed(1);
    updateImageScale();
}