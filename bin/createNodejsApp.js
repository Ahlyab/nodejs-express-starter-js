#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'coverage', 'bin']);
const EXCLUDE_FILES = new Set(['.env']);

function copyRecursive(src, dest, templateRoot, excludeDirName) {
  const stat = fs.statSync(src);
  const basename = path.basename(src);

  if (EXCLUDE_DIRS.has(basename)) return;
  if (excludeDirName && basename === excludeDirName) return;
  if (basename === '.env' || (basename.startsWith('.env') && !basename.endsWith('.example'))) return;

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), templateRoot, excludeDirName);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  const projectName = process.argv[2];
  if (!projectName) {
    console.error('Usage: npx create-nodejs-express-app <project-name>');
    console.error('Example: npx create-nodejs-express-app my-api');
    process.exit(1);
  }

  const templateRoot = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: "${projectName}" already exists in this directory.`);
    process.exit(1);
  }

  console.log(`Creating a new Express app in ./${projectName}...`);

  try {
    fs.mkdirSync(targetDir, { recursive: true });
  } catch (err) {
    if (err.code === 'EACCES') {
      console.error(`Error: Permission denied creating folder at ${targetDir}`);
      console.error('Run the command from a directory you can write to (e.g. your home or Desktop):');
      console.error(`  cd ~/Desktop && npx create-nodejs-express-app ${projectName}`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }

  const entries = fs.readdirSync(templateRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'bin') continue;
    if (entry.name === projectName) continue; // avoid copying a same-named folder (e.g. from a previous run) into itself
    const srcPath = path.join(templateRoot, entry.name);
    const destPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        copyRecursive(srcPath, destPath, templateRoot, projectName);
      }
    } else {
      const skip =
        EXCLUDE_FILES.has(entry.name) ||
        entry.name === '.env' ||
        (entry.name.startsWith('.env') && !entry.name.endsWith('.example'));
      if (!skip) fs.copyFileSync(srcPath, destPath);
    }
  }

  // Copy .env.example to .env in the new project
  const envExample = path.join(templateRoot, '.env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, path.join(targetDir, '.env'));
  }

  console.log('Installing dependencies...');
  const install = spawnSync('npm', ['install'], {
    cwd: targetDir,
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    console.error('npm install failed. You can run it manually inside the project.');
    process.exit(install.status || 1);
  }

  console.log('');
  console.log(`Done! Your app is in ./${projectName}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  cd ${projectName}`);
  console.log('  cp .env.example .env   # then edit .env with your settings');
  console.log('  npm run dev            # start development server');
  console.log('');
}

main();
