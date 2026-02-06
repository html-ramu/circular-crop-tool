// --- script.js ---

// 1. Select DOM elements
const imageInput = document.getElementById('imageInput');
const sourceImage = document.getElementById('sourceImage');
const cropBox = document.getElementById('cropBox');
const cropBtn = document.getElementById('cropBtn');
const croppedResult = document.getElementById('croppedResult');
const workspace = document.getElementById('workspace');

// Select Control elements
const resizeControls = document.getElementById('resizeControls');
const resizeSlider = document.getElementById('resizeSlider');
const sliderValue = document.getElementById('sliderValue');
const downloadArea = document.getElementById('downloadArea');
const downloadLink = document.getElementById('downloadLink');

let isDragging = false;

// 2. Handle Image Upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sourceImage.src = e.target.result;
            sourceImage.classList.add('loaded');
            
            // Reset crop box to center
            cropBox.style.left = '50%';
            cropBox.style.top = '50%';
            
            // Show the resize controls
            resizeControls.classList.remove('hidden');
            
            // Hide download area until they crop again
            downloadArea.classList.add('hidden');
            croppedResult.classList.remove('has-result');
        };
        reader.readAsDataURL(file);
    }
});

// 3. Handle Resize Slider
resizeSlider.addEventListener('input', function(e) {
    const newSize = e.target.value + 'px';
    // Update the visual box size
    cropBox.style.width = newSize;
    cropBox.style.height = newSize;
    // Update the text display
    sliderValue.textContent = newSize;
});

// ==========================================
// 4. UNIFIED DRAG LOGIC (MOUSE & TOUCH)
// ==========================================

function moveBox(clientX, clientY) {
    const rect = workspace.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    cropBox.style.left = x + 'px';
    cropBox.style.top = y + 'px';
}

// --- MOUSE EVENTS ---
workspace.addEventListener('mousedown', function(e) {
    if(e.target === cropBox) {
        isDragging = true;
        cropBox.style.cursor = 'grabbing';
    }
});

window.addEventListener('mouseup', function() {
    isDragging = false;
    cropBox.style.cursor = 'move';
});

workspace.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    moveBox(e.clientX, e.clientY);
});

// --- TOUCH EVENTS ---
cropBox.addEventListener('touchstart', function(e) {
    isDragging = true;
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', function() {
    isDragging = false;
});

workspace.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0]; 
    moveBox(touch.clientX, touch.clientY);
}, { passive: false });

// ==========================================

// 5. CROP LOGIC
cropBtn.addEventListener('click', function() {
    if (!sourceImage.src) return alert('Please upload an image first!');

    // Calculate Scale (Visual Size vs Real Size)
    // This automatically works even if CSS resized the image!
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;

    const boxRect = cropBox.getBoundingClientRect();
    const imageRect = sourceImage.getBoundingClientRect();

    const cropX = (boxRect.left - imageRect.left) * scaleX;
    const cropY = (boxRect.top - imageRect.top) * scaleY;
    const cropWidth = boxRect.width * scaleX;
    const cropHeight = cropWidth; 

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    // Draw Circle Mask
    const radius = cropWidth / 2;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); 

    // Draw Image
    ctx.drawImage(
        sourceImage, 
        -cropX, 
        -cropY, 
        sourceImage.naturalWidth, 
        sourceImage.naturalHeight
    );

    // --- DOWNLOAD FIX ---
    const croppedDataUrl = canvas.toDataURL('image/png');
    
    croppedResult.src = croppedDataUrl;
    croppedResult.classList.add('has-result');

    downloadLink.href = croppedDataUrl;
    downloadLink.download = "circular-crop-result.png"; 

    downloadArea.classList.remove('hidden');
});