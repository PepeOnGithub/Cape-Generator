const toggleBtn = document.getElementById('theme-toggle'); let templateZip; const baseTemplate = new Image();

fetch('MCT_Cape_Template.mcpack.zip') .then(res => res.arrayBuffer()) .then(buffer => JSZip.loadAsync(buffer)) .then(zip => { templateZip = zip; return zip.file('textures/entity/cape_invisible.png').async('blob'); }) .then(blob => { baseTemplate.src = URL.createObjectURL(blob); });

const canvas = document.getElementById('cape-canvas'); const ctx = canvas.getContext('2d');

baseTemplate.onload = () => { ctx.drawImage(baseTemplate, 0, 0, canvas.width, canvas.height); };

const img = new Image();

document.getElementById('image-input').addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { img.src = reader.result; }; reader.readAsDataURL(file); });

img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); ctx.drawImage(baseTemplate, 0, 0, canvas.width, canvas.height); };

document.getElementById('download-btn').addEventListener('click', async () => { if (!templateZip) return alert('Template not loaded yet!'); const packName = document.getElementById('pack-name').value.trim() || 'MyCape'; const filename = ${packName.replace(/[^a-z0-9]/gi, '_')}.mcpack; canvas.toBlob(async blob => { templateZip.file('textures/entity/cape_invisible.png', blob); const content = await templateZip.generateAsync({ type: 'blob', compression: 'DEFLATE' }); saveAs(content, filename); }, 'image/png'); });

toggleBtn.addEventListener('click', () => { document.documentElement.classList.toggle('dark'); toggleBtn.innerHTML = document.documentElement.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; });

