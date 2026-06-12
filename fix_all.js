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
      
      // We want to replace fetch('/api/...') with fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/...`)
      // Match fetch( followed by ' or " or ` then /api/
      
      let newContent = content.replace(/fetch\(['"`]\/api\/(.*?)['"`](\s*[,)])/g, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`$2');
      newContent = newContent.replace(/useSWR\(['"`]\/api\/(.*?)['"`](\s*[,)])/g, 'useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`$2');
      
      // Also match fetch(`/api/module/${id}`) where it has template literals
      newContent = newContent.replace(/fetch\(`\/api\/(.*?)`(\s*[,)])/g, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`$2');
      newContent = newContent.replace(/useSWR\(`\/api\/(.*?)`(\s*[,)])/g, 'useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`$2');

      // Let's also fix fetch("/api/ai/chat", ...)
      // My previous replace would do: fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, ...)
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('frontend/src');
