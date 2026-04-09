const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(__dirname, 'src');

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace userId references in req.user
    content = content.replace(/req\.user(\?|)\.userId/g, "req.user$1.id");
    
    if (original !== content) {
      console.log(`✅ Updated req.user.id in: ${filePath}`);
      fs.writeFileSync(filePath, content);
    }
  }
});

console.log('🏁 Identity normalization complete.');
