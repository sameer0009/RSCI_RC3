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
    
    // Replace role strings
    content = content.replace(/'USER'/g, "'STUDENT'");
    content = content.replace(/"USER"/g, '"STUDENT"');
    content = content.replace(/'INSTRUCTOR'/g, "'CONTEST_MANAGER'");
    content = content.replace(/"INSTRUCTOR"/g, '"CONTEST_MANAGER"');
    
    // Fix specific known count issues
    if (filePath.includes('analytics.service.ts')) {
       content = content.replace(/user\._count\.submissions/g, '(user as any)._count.submissions');
    }

    if (original !== content) {
      console.log(`✅ Updated roles in: ${filePath}`);
      fs.writeFileSync(filePath, content);
    }
  }
});

console.log('🏁 Global role replacement complete.');
