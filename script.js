// --- script.js ---

const imageInput = document.getElementById('imageInput');
const sourceImage = document.getElementById('sourceImage');
const cropBox = document.getElementById('cropBox');
const cropBtn = document.getElementById('cropBtn');
const croppedResult = document.getElementById('croppedResult');
const workspace = document.getElementById('workspace');

const resizeControls = document.getElementById('resizeControls');
const resizeSlider = document.getElementById('resizeSlider');
const sliderValue = document.getElementById('sliderValue');
const downloadArea = document.getElementById('downloadArea');
const downloadLink = document.getElementById('downloadLink');

let isDragging = false;

// Handle Image Upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sourceImage.src = e.target.result;
            sourceImage.classList.add('loaded');
            cropBox.style.left = '50%';
            cropBox.style.top = '50%';
            resizeControls.classList.remove('hidden');
            downloadArea.classList.add('hidden');
            croppedResult.classList.remove('has-result');
        };
        reader.readAsDataURL(file);
    }
});

// Handle Resize
resizeSlider.addEventListener('input', function(e) {
    const newSize = e.target.value + 'px';
    cropBox.style.width = newSize;
    cropBox.style.height = newSize;
    sliderValue.textContent = newSize;
});

function moveBox(clientX, clientY) {
    const rect = workspace.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    cropBox.style.left = x + 'px';
    cropBox.style.top = y + 'px';
}

// Mouse Events
workspace.addEventListener('mousedown', function(e) {
    if(e.target === cropBox) { isDragging = true; cropBox.style.cursor = 'grabbing'; }
});
window.addEventListener('mouseup', function() { isDragging = false; cropBox.style.cursor = 'move'; });
workspace.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    moveBox(e.clientX, e.clientY);
});

// Touch Events
cropBox.addEventListener('touchstart', function(e) {
    isDragging = true; e.preventDefault();
}, { passive: false });
window.addEventListener('touchend', function() { isDragging = false; });
workspace.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0]; 
    moveBox(touch.clientX, touch.clientY);
}, { passive: false });

// Crop Logic
cropBtn.addEventListener('click', function() {
    if (!sourceImage.src) return alert('Please upload an image first!');
    
    // Scale Logic for Responsive Images
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    const boxRect = cropBox.getBoundingClientRect();
    const imageRect = sourceImage.getBoundingClientRect();
    const cropX = (boxRect.left - imageRect.left) * scaleX;
    const cropY = (boxRect.top - imageRect.top) * scaleY;
    const cropWidth = boxRect.width * scaleX;
    const cropHeight = cropWidth; 

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    const radius = cropWidth / 2;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); 

    ctx.drawImage(sourceImage, -cropX, -cropY, sourceImage.naturalWidth, sourceImage.naturalHeight);

    const croppedDataUrl = canvas.toDataURL('image/png');
    croppedResult.src = croppedDataUrl;
    croppedResult.classList.add('has-result');
    downloadLink.href = croppedDataUrl;
    downloadLink.download = "circular-crop-result.png"; 
    downloadArea.classList.remove('hidden');
});