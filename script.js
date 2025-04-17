const toggleBtn = document.getElementById('theme-toggle');
let templateZip = null;
let uploadedImageBlob = null;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

(async function init() {
  try {
    const cachedTemplate = localStorage.getItem('cachedCapeTemplate');
    if (cachedTemplate) {
      const buffer = Uint8Array.from(atob(cachedTemplate), c => c.charCodeAt(0)).buffer;
      templateZip = await JSZip.loadAsync(buffer);
    } else {
      const response = await fetch('Cape_Template.zip');
      if (!response.ok) throw new Error(`Failed to fetch template (${response.status})`);
      const buffer = await response.arrayBuffer();
      templateZip = await JSZip.loadAsync(buffer);
      localStorage.setItem('cachedCapeTemplate', btoa(String.fromCharCode(...new Uint8Array(buffer))));
    }
    if (!templateZip.file('textures/entity/cape_invisible.png')) {
      throw new Error('Template missing required files');
    }
    document.getElementById('status').textContent = 'Ready to generate!';
  } catch (error) {
    console.error('Template error:', error);
    alert(`Template loading failed: ${error.message}`);
  }
})();

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
      canvas.toBlob(blob => { uploadedImageBlob = blob; }, 'image/png');
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('download-btn').addEventListener('click', async () => {
  if (!templateZip) return alert('Template still loading...');
  if (!uploadedImageBlob) return alert('Please upload a cape image first.');
  try {
    const packName = document.getElementById('pack-name').value.trim() || 'MyCape';
    const safeFileName = `${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack`;
    const cleanName = packName.replace(/_/g, ' ');
    const newZip = templateZip.clone();
    newZip.file('textures/entity/cape_invisible.png', uploadedImageBlob);
    newZip.file('pack_icon.png', uploadedImageBlob);
    const manifestFile = newZip.file('manifest.json');
    if (!manifestFile) throw new Error('manifest.json missing');
    const manifest = JSON.parse(await manifestFile.async('string'));
    manifest.header.name = cleanName;
    manifest.header.description = `${cleanName} made using Pepe's Cape Generator`;
    manifest.header.uuid = uuidv4();
    if (Array.isArray(manifest.modules)) {
      manifest.modules.forEach(mod => { mod.uuid = uuidv4(); });
    }
    newZip.file('manifest.json', JSON.stringify(manifest, null, 4));
    const content = await newZip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    saveAs(new File([content], safeFileName, { type: 'application/octet-stream' }));
  } catch (error) {
    console.error('Generation error:', error);
    alert('Failed to create cape: ' + error.message);
  }
});

toggleBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  toggleBtn.innerHTML = document.documentElement.classList.contains('dark')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});