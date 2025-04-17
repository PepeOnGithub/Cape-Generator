const toggleBtn = document.getElementById('theme-toggle');
let templateZip;

// Load template with just cape_invisible.png
const loadTemplate = async () => {
    try {
        const response = await fetch('Cape_Template.mcpack');
        const buffer = await response.arrayBuffer();
        templateZip = await JSZip.loadAsync(buffer);
        
        // Load the single cape file
        const capeBlob = await templateZip.file('textures/entity/cape_invisible.png').async('blob');
        const baseTemplate = new Image();
        baseTemplate.src = URL.createObjectURL(capeBlob);
        
        // Initialize canvas
        const canvas = document.getElementById('cape-canvas');
        const ctx = canvas.getContext('2d');
        baseTemplate.onload = () => {
            ctx.drawImage(baseTemplate, 0, 0, canvas.width, canvas.height);
        };
    } catch (error) {
        console.error('Error loading template:', error);
        alert('Failed to load template! Please check the console.');
    }
};

// Image handling with dimension validation
document.getElementById('image-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const canvas = document.getElementById('cape-canvas');
    const ctx = canvas.getContext('2d');
    
    // Load and validate image
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
        if (img.width !== 64 || img.height !== 32) {
            alert('Image must be exactly 64x32 pixels!');
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
});

// Modified download handler for single cape file
document.getElementById('download-btn').addEventListener('click', async () => {
    if (!templateZip) return alert('Template not loaded yet!');
    
    const canvas = document.getElementById('cape-canvas');
    const packName = document.getElementById('pack-name').value.trim() || 'MyCape';
    const filename = `${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack`;

    try {
        canvas.toBlob(async (blob) => {
            // Create new zip with all original files
            const newZip = new JSZip();
            
            // Copy all files from template except our cape
            templateZip.forEach(async (relativePath, file) => {
                if (!file.dir) {
                    const content = await file.async('uint8array');
                    newZip.file(relativePath, content);
                }
            });

            // Replace just the cape_invisible.png
            newZip.file('textures/entity/cape_invisible.png', blob);

            // Generate final package
            const content = await newZip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE'
            });
            
            saveAs(content, filename);
        }, 'image/png');
    } catch (error) {
        console.error('Generation failed:', error);
        alert('Failed to generate cape! Check console for details.');
    }
});

// Theme toggle remains the same
toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    toggleBtn.innerHTML = document.documentElement.classList.contains('dark') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});