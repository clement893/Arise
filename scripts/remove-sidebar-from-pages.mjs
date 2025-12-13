import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardDir = path.join(__dirname, '../src/app/dashboard');

function removeSidebarFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove Sidebar import
  const sidebarImportRegex = /import\s+Sidebar\s+from\s+['"]@\/components\/dashboard\/Sidebar['"];?\n?/g;
  if (sidebarImportRegex.test(content)) {
    content = content.replace(sidebarImportRegex, '');
    modified = true;
  }

  // Remove Sidebar component usage and wrapper div
  const sidebarPattern = /<div\s+className="min-h-screen\s+bg-\[#f0f5f5\]\s+flex">\s*<Sidebar[^>]*\/>\s*<main/g;
  if (sidebarPattern.test(content)) {
    content = content.replace(sidebarPattern, '<main');
    modified = true;
  }

  // Also handle bg-gray-100 variant
  const sidebarPatternGray = /<div\s+className="min-h-screen\s+bg-gray-100\s+flex">\s*<Sidebar[^>]*\/>\s*<main/g;
  if (sidebarPatternGray.test(content)) {
    content = content.replace(sidebarPatternGray, '<main');
    modified = true;
  }

  // Remove closing wrapper div
  const closingDivPattern = /<\/main>\s*<\/div>\s*\);\s*}/;
  if (closingDivPattern.test(content)) {
    content = content.replace(closingDivPattern, '</main>\n  );\n}');
    modified = true;
  }

  // Remove handleLogout function if it only does logout
  const logoutFunctionPattern = /const\s+handleLogout\s*=\s*\(\)\s*=>\s*\{[^}]*localStorage\.removeItem\(['"]arise_user['"]\);[^}]*router\.push\(['"]\/['"]\);[^}]*\};\s*\n?/g;
  if (logoutFunctionPattern.test(content)) {
    content = content.replace(logoutFunctionPattern, '');
    modified = true;
  }

  // Remove router import if not used elsewhere
  const routerUsage = content.match(/router\./g);
  if (!routerUsage || routerUsage.length === 0) {
    const routerImportRegex = /import\s+\{[^}]*useRouter[^}]*\}\s+from\s+['"]next\/navigation['"];?\n?/g;
    if (routerImportRegex.test(content)) {
      // Check if router is still used
      const stillUsed = content.includes('router.') || content.includes('router,');
      if (!stillUsed) {
        content = content.replace(routerImportRegex, '');
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Modified: ${filePath}`);
    return true;
  }
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file === 'page.tsx') {
      removeSidebarFromFile(filePath);
    }
  }
}

console.log('Removing Sidebar from dashboard pages...\n');
processDirectory(dashboardDir);
console.log('\nDone!');
