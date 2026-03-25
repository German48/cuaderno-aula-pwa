import sharp from 'sharp';

const outDir = 'C:/Users/Administrador/OneDrive/CODER/cuaderno-aula-pwa/public';

async function generateIcons() {
  // Create a simple icon with the app colors
  const svg = `
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="96" fill="#4F46E5"/>
    <rect x="80" y="120" width="352" height="272" rx="24" fill="white" opacity="0.95"/>
    <rect x="120" y="160" width="160" height="16" rx="8" fill="#4F46E5" opacity="0.6"/>
    <rect x="120" y="192" width="272" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
    <rect x="120" y="216" width="240" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
    <rect x="120" y="240" width="256" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
    <rect x="120" y="272" width="120" height="16" rx="8" fill="#D97706" opacity="0.7"/>
    <rect x="120" y="304" width="272" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
    <rect x="120" y="328" width="200" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
    <rect x="120" y="352" width="232" height="10" rx="5" fill="#4F46E5" opacity="0.3"/>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile(outDir + '/icon-192.png');

  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile(outDir + '/icon-512.png');

  console.log('✅ Iconos generados: icon-192.png, icon-512.png');
}

generateIcons().catch(console.error);
