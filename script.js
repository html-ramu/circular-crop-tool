// --- script.js ---

const imageInput = document.getElementById('imageInput');
const sourceImage = document.getElementById('sourceImage');
const cropBox = document.getElementById('cropBox');
const cropBtn = document.getElementById('cropBtn');
const croppedResult = document.getElementById('croppedResult');
const workspace = document.getElementById('workspace');
const downloadArea = document.getElementById('downloadArea');
const downloadLink = document.getElementById('downloadLink');

// Shape Controls
const shapeRadios = document.querySelectorAll('input[name="cropShape"]');
const shapeSelector = document.getElementById('shapeSelector');

// Circle Controls
const circleControls = document.getElementById('circleControls');
const resizeSlider = document.getElementById('resizeSlider');
const sliderValue = document.getElementById('sliderValue');

// Rect Controls
const rectControls = document.getElementById('rectControls');
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const heightSlider = document.getElementById('heightSlider');
const heightValue = document.getElementById('heightValue');

let isDragging = false;
let currentShape = 'circle'; // Default mode

// 1. Handle Image Upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sourceImage.src = e.target.result;
            sourceImage.classList.add('loaded');
            
            // Reset position
            cropBox.style.left = '50%';
            cropBox.style.top = '50%';
            
            // Show shape selector and default controls
            shapeSelector.classList.remove('hidden');
            updateControlVisibility();
            
            downloadArea.classList.add('hidden');
            croppedResult.classList.remove('has-result');
        };
        reader.readAsDataURL(file);
    }
});

// 2. Handle Shape Switching
shapeRadios.forEach(radio => {
    radio.addEventListener('change', function(e) {
        currentShape = e.target.value;
        updateControlVisibility();
    });
});

function updateControlVisibility() {
    if (currentShape === 'circle') {
        cropBox.classList.remove('rect-shape');
        circleControls.classList.remove('hidden');
        rectControls.classList.add('hidden');
        
        // Reset to square based on circle slider
        const size = resizeSlider.value + 'px';
        cropBox.style.width = size;
        cropBox.style.height = size;
    } else {
        cropBox.classList.add('rect-shape');
        circleControls.classList.add('hidden');
        rectControls.classList.remove('hidden');
        
        // Apply rect slider values
        cropBox.style.width = widthSlider.value + 'px';
        cropBox.style.height = heightSlider.value + 'px';
    }
}

// 3. Handle Resizing
// Circular Resize
resizeSlider.addEventListener('input', function(e) {
    const newSize = e.target.value + 'px';
    cropBox.style.width = newSize;
    cropBox.style.height = newSize;
    sliderValue.textContent = newSize;
});

// Rect Width Resize
widthSlider.addEventListener('input', function(e) {
    const newSize = e.target.value + 'px';
    cropBox.style.width = newSize;
    widthValue.textContent = newSize;
});

// Rect Height Resize
heightSlider.addEventListener('input', function(e) {
    const newSize = e.target.value + 'px';
    cropBox.style.height = newSize;
    heightValue.textContent = newSize;
});


// 4. Drag Logic (Works for both shapes)
function moveBox(clientX, clientY) {
    const rect = workspace.getBoundingClientRect();
    const boxRect = cropBox.getBoundingClientRect();

    let x = clientX - rect.left;
    let y = clientY - rect.top;
    
    // Simple centering logic for pointer
    cropBox.style.left = x + 'px';
    cropBox.style.top = y + 'px';
}

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


// 5. Crop Logic
cropBtn.addEventListener('click', function() {
    if (!sourceImage.src) return alert('Please upload an image first!');
    
    // Scale Logic
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    
    const boxRect = cropBox.getBoundingClientRect();
    const imageRect = sourceImage.getBoundingClientRect();
    
    // Calculate crop coordinates relative to the original image
    const cropX = (boxRect.left - imageRect.left) * scaleX;
    const cropY = (boxRect.top - imageRect.top) * scaleY;
    const cropWidth = boxRect.width * scaleX;
    const cropHeight = boxRect.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    if (currentShape === 'circle') {
        // --- Circular Crop Logic ---
        const radius = cropWidth / 2;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip(); 
    } 
    // If Rectangle, we just skip the clip() step and draw directly

    ctx.drawImage(
        sourceImage, 
        cropX, cropY,       // Start at cropX, cropY on source
        cropWidth, cropHeight, // Grab this much width/height from source
        0, 0,               // Place at 0,0 on canvas
        cropWidth, cropHeight // Draw this big on canvas
    );

    const croppedDataUrl = canvas.toDataURL('image/png');
    croppedResult.src = croppedDataUrl;
    croppedResult.classList.add('has-result');
    downloadLink.href = croppedDataUrl;
    downloadLink.download = `crop-result-${currentShape}.png`; 
    downloadArea.classList.remove('hidden');
});