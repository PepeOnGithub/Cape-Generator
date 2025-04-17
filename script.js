const toggleBtn = document.getElementById('theme-toggle');
let templateZip = null;

// Template loading with error feedback
(async function init() {
    try {
        // 1. Load template
        const response = await fetch('Cape_Template.zip');
        if (!response.ok) throw new Error(`Failed to fetch template (${response.status})`);
        
        // 2. Verify content type
        if (!response.headers.get('Content-Type').includes('zip')) {
            throw new Error('Invalid template format - must be ZIP');
        }

        // 3. Parse template
        const buffer = await response.arrayBuffer();
        templateZip = await JSZip.loadAsync(buffer);
        
        // 4. Verify critical file exists
        if (!templateZip.file('textures/entity/cape_invisible.png')) {
            throw new Error('Template missing textures/entity/cape_invisible.png');
        }

        console.log('Template loaded successfully!');
        document.getElementById('status').textContent = 'Ready to generate!';

    } catch (error) {
        console.error('Template error:', error);
        alert(`TEMPLATE ERROR: ${error.message}`);
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