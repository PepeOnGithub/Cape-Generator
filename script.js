const toggleBtn = document.getElementById('theme-toggle');
let templateZip = null;

// UUID generator
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// Template loading with error feedback
(async function init() {
    try {
        const response = await fetch('Cape_Template.zip');
        if (!response.ok) throw new Error(`Failed to fetch template (${response.status})`);
        
        if (!response.headers.get('Content-Type').includes('zip')) {
            throw new Error('Invalid template format - must be ZIP');
        }

        const buffer = await response.arrayBuffer();
        templateZip = await JSZip.loadAsync(buffer);
        
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

// Image handler
document.getElementById('image-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('cape-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Download handler with UUID + manifest update
document.getElementById('download-btn').addEventListener('click', async () => {
    if (!templateZip) return alert('Template still loading... Please wait');
    
    try {
        const canvas = document.getElementById('cape-canvas');
        const packName = document.getElementById('pack-name').value.trim() || 'MyCape';
        const safeFileName = `${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack`;
        const cleanName = packName.replace(/_/g, ' ');

        canvas.toBlob(async (blob) => {
            const newZip = templateZip.clone();
            newZip.file('textures/entity/cape_invisible.png', blob);

            const manifestFile = newZip.file('manifest.json');
            if (!manifestFile) throw new Error('manifest.json is missing in template');

            const manifestText = await manifestFile.async('string');
            const manifest = JSON.parse(manifestText);

            manifest.header.name = cleanName;
            manifest.header.description = `${cleanName} made using Pepe's Cape Generator`;
            manifest.header.uuid = uuidv4();

            if (Array.isArray(manifest.modules)) {
                manifest.modules.forEach(mod => {
                    mod.uuid = uuidv4();
                });
            }

            newZip.file('manifest.json', JSON.stringify(manifest, null, 4));

            const content = await newZip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            saveAs(content, safeFileName);
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
