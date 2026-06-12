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
      
      let newContent = content.replace(/window\.open\(`\/api\/(.*?)`/g, 'window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
      newContent = newContent.replace(/const url = `\/api\/(.*?)`/g, 'const url = `${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
      newContent = newContent.replace(/let url = `\/api\/(.*?)`/g, 'let url = `${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('frontend/src');
