const toggleBtn = document.getElementById('theme-toggle');
let templateZip = null;

// Immediately load template on page load
(async function init() {
    try {
        // 1. Load template file
        const response = await fetch('Cape_Template.mcpack');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // 2. Parse template
        const buffer = await response.arrayBuffer();
        templateZip = await JSZip.loadAsync(buffer);
        
        // 3. Verify critical files exist
        if (!templateZip.file('textures/entity/cape_invisible.png')) {
            throw new Error('Template missing required cape file');
        }

        // 4. Initialize canvas with transparent background
        const canvas = document.getElementById('cape-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        console.log('Template loaded successfully!');
    } catch (error) {
        console.error('Template loading failed:', error);
        alert(`Template load failed: ${error.message}`);
    }
})();

// Image handling
document.getElementById('image-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('cape-canvas');
            const ctx = canvas.getContext('2d');
            
            // Clear and draw new image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Download handler
document.getElementById('download-btn').addEventListener('click', async () => {
    if (!templateZip) return alert('Template still loading... Please wait');
    
    try {
        const canvas = document.getElementById('cape-canvas');
        const packName = document.getElementById('pack-name').value.trim() || 'MyCape';
        const filename = `${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack`;

        canvas.toBlob(async (blob) => {
            // Clone template and replace cape
            const newZip = templateZip.clone();
            newZip.file('textures/entity/cape_invisible.png', blob);
            
            // Generate and save
            const content = await newZip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });
            
            saveAs(content, filename);
        }, 'image/png');
    } catch (error) {
        console.error('Generation error:', error);
        alert('Failed to create cape: ' + error.message);
    }
});

// Theme toggle
toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    toggleBtn.innerHTML = document.documentElement.classList.contains('dark') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});