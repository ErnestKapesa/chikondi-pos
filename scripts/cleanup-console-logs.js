#!/usr/bin/env node

// Script to clean up console.log statements and replace with logger
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// Files to process
const filesToProcess = [];

// Recursively find all JS/JSX files
function findFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      filesToProcess.push(filePath);
    }
  });
}

// Replace console statements with logger
function cleanupFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes("import { logger }") || 
                         content.includes("from '../utils/logger'") ||
                         content.includes("from './utils/logger'");
  
  // Replace console.log with logger.log
  const logMatches = content.match(/console\.log\(/g);
  if (logMatches && logMatches.length > 0) {
    content = content.replace(/console\.log\(/g, 'logger.log(');
    modified = true;
    console.log(`✅ Replaced ${logMatches.length} console.log statements in ${path.relative(srcDir, filePath)}`);
  }
  
  // Replace console.error with logger.error
  const errorMatches = content.match(/console\.error\(/g);
  if (errorMatches && errorMatches.length > 0) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
    console.log(`✅ Replaced ${errorMatches.length} console.error statements in ${path.relative(srcDir, filePath)}`);
  }
  
  // Replace console.warn with logger.warn
  const warnMatches = content.match(/console\.warn\(/g);
  if (warnMatches && warnMatches.length > 0) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    modified = true;
    console.log(`✅ Replaced ${warnMatches.length} console.warn statements in ${path.relative(srcDir, filePath)}`);
  }
  
  // Add logger import if needed and file was modified
  if (modified && !hasLoggerImport) {
    // Find the right import path
    const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'utils/logger.js'));
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    const cleanImportPath = importPath.replace(/\\/g, '/').replace('.js', '');
    
    // Add import after existing imports
    const importRegex = /^import.*from.*['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      const loggerImport = `\nimport { logger } from '${cleanImportPath}';`;
      content = content.slice(0, insertIndex) + loggerImport + content.slice(insertIndex);
      
      console.log(`✅ Added logger import to ${path.relative(srcDir, filePath)}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
console.log('🧹 Starting console.log cleanup...\n');

findFiles(srcDir);

let totalFilesModified = 0;
let totalReplacements = 0;

filesToProcess.forEach(filePath => {
  if (cleanupFile(filePath)) {
    totalFilesModified++;
  }
});

console.log(`\n🎉 Cleanup completed!`);
console.log(`📁 Files processed: ${filesToProcess.length}`);
console.log(`✏️  Files modified: ${totalFilesModified}`);
console.log(`\n📋 Next steps:`);
console.log(`1. Review the changes with: git diff`);
console.log(`2. Test the application: npm run dev`);
console.log(`3. Build for production: npm run build`);
console.log(`4. Commit changes: git add . && git commit -m "🧹 Replace console statements with logger"`);