const toggleBtn = document.getElementById('theme-toggle');
let templateZip;

// Theme Toggle
toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    toggleBtn.innerHTML = document.documentElement.classList.contains('dark') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Load template
const baseTemplate = new Image();
fetch('MCT_Cape_Template.mcpack.zip')
    .then(res => res.arrayBuffer())
    .then(buffer => JSZip.loadAsync(buffer))
    .then(zip => {
        templateZip = zip;
        return zip.file('textures/entity/cape_invisible.png').async('blob');
    })
    .then(blob => { baseTemplate.src = URL.createObjectURL(blob); });

// Canvas setup
const canvas = document.getElementById('cape-canvas');
const ctx = canvas.getContext('2d');
baseTemplate.onload = () => ctx.drawImage(baseTemplate, 0, 0, canvas.width, canvas.height);

// Image handling
const img = new Image();
document.getElementById('image-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.readAsDataURL(file);
});

img.onload

img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the user's image first
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Then draw the template on top (assuming template has transparency)
    ctx.drawImage(baseTemplate, 0, 0, canvas.width, canvas.height);
};

document.getElementById('download-btn').addEventListener('click', async () => {
    if (!templateZip) return alert('Template not loaded yet!');
    
    const packName = document.getElementById('pack-name').value.trim() || 'MyCape';
    const filename = `${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack`;

    canvas.toBlob(async (blob) => {
        const zip = templateZip;
        
        // Replace BOTH files to ensure complete override
        zip.file('textures/entity/cape_invisible.png', blob);
        zip.file('textures/entity/cape.png', blob); // Add this line
        
        const content = await zip.generateAsync({type:'blob', compression:'DEFLATE'});
        saveAs(content, filename);
    }, 'image/png'); // Ensure PNG format
});