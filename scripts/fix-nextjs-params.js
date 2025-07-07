const fs = require('fs');
const path = require('path');

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix function signatures
    content = content.replace(
      /export async function (GET|POST|PUT|DELETE|PATCH)\s*\(\s*request:\s*NextRequest,\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*([^}]+)\s*\}\s*\}\)/g,
      (match, method, paramsType) => {
        modified = true;
        return `export async function ${method}(
  request: NextRequest,
  { params }: { params: Promise<{ ${paramsType} }> }
)`;
      }
    );

    // Fix params.id usage
    content = content.replace(
      /const\s+(\w+)\s*=\s*params\.id;/g,
      (match, varName) => {
        modified = true;
        return `const { id: ${varName} } = await params;`;
      }
    );

    // Fix direct params.id usage in queries
    content = content.replace(
      /\.eq\("id",\s*params\.id\)/g,
      (match) => {
        modified = true;
        return `.eq("id", projectId)`;
      }
    );

    content = content.replace(
      /\.eq\("project_id",\s*params\.id\)/g,
      (match) => {
        modified = true;
        return `.eq("project_id", projectId)`;
      }
    );

    content = content.replace(
      /\.eq\("task_id",\s*params\.id\)/g,
      (match) => {
        modified = true;
        return `.eq("task_id", taskId)`;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Find all API route files
function findApiFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findApiFiles(fullPath));
    } else if (item === 'route.ts' && fullPath.includes('/api/')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const apiDir = path.join(__dirname, '../app/api');
const apiFiles = findApiFiles(apiDir);

console.log(`Found ${apiFiles.length} API route files to fix:`);
apiFiles.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\nFixing files...');
apiFiles.forEach(fixFile);
console.log('Done!'); 