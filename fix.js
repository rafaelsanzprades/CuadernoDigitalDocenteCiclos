const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We will replace fetch("/api/...") with fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/...`)
      // But we need to use backticks.
      // So fetch("/api/families") becomes fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      
      let newContent = content.replace(/fetch\("\/api\/([^"]+)"\)/g, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`)');
      newContent = newContent.replace(/useSWR\('\/api\/([^']+)',/g, 'useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`,');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('frontend/src');
