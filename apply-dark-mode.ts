import * as fs from 'fs';
import * as path from 'path';

const targetDirs = ['app', 'components'];
const fileExtensions = ['.tsx', '.ts'];

interface ReplacementRule {
  regex: RegExp;
  replacement: string;
}

// Global replacements applied to all .tsx/.ts files
const globalReplacements: ReplacementRule[] = [
  // 1. Base Tailwind dark mode class mappings
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-slate-50(?!\/)/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
  { regex: /(?<!dark:)bg-slate-50\/80/g, replacement: 'bg-slate-50/80 dark:bg-slate-900/80' },
  { regex: /(?<!dark:)bg-slate-50\/70/g, replacement: 'bg-slate-50/70 dark:bg-slate-900/70' },
  { regex: /(?<!dark:)bg-slate-50\/50/g, replacement: 'bg-slate-50/50 dark:bg-slate-900/50' },
  { regex: /(?<!dark:)border-slate-200(?!\/)/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-100(?!\/)/g, replacement: 'border-slate-100 dark:border-slate-800' },
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-slate-50' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)hover:bg-slate-50(?!\/)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-800' },
  { regex: /(?<!dark:)hover:bg-slate-100(?!\/)/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },

  // 2. High-Contrast Contrast/Color Refinements
  { regex: /dark:bg-blue-900\/[0-9]+/g, replacement: 'dark:bg-blue-500/10' },
  { regex: /dark:hover:bg-blue-900\/[0-9]+/g, replacement: 'dark:hover:bg-blue-500/20' },
  { regex: /dark:border-blue-800/g, replacement: 'dark:border-blue-500/20' },
  { regex: /dark:bg-purple-900\/[0-9]+/g, replacement: 'dark:bg-purple-500/10' },
  { regex: /dark:hover:bg-purple-900\/[0-9]+/g, replacement: 'dark:hover:bg-purple-500/20' },
  { regex: /dark:border-purple-800/g, replacement: 'dark:border-purple-500/20' },
  { regex: /dark:bg-orange-900\/[0-9]+/g, replacement: 'dark:bg-orange-500/10' },
  { regex: /dark:hover:bg-orange-900\/[0-9]+/g, replacement: 'dark:hover:bg-orange-500/20' },
  { regex: /dark:border-orange-800/g, replacement: 'dark:border-orange-500/20' },
  { regex: /dark:bg-green-900\/[0-9]+/g, replacement: 'dark:bg-emerald-500/10' },
  { regex: /dark:hover:bg-green-900\/[0-9]+/g, replacement: 'dark:hover:bg-emerald-500/20' },
  { regex: /dark:border-green-800/g, replacement: 'dark:border-emerald-500/20' },
  { regex: /dark:text-green-400/g, replacement: 'dark:text-emerald-400' },
  { regex: /dark:bg-indigo-900\/[0-9]+/g, replacement: 'dark:bg-indigo-500/10' },
  { regex: /dark:hover:bg-indigo-900\/[0-9]+/g, replacement: 'dark:hover:bg-indigo-500/20' },
  { regex: /dark:border-indigo-800/g, replacement: 'dark:border-indigo-500/20' },
  { regex: /dark:bg-red-900\/[0-9]+/g, replacement: 'dark:bg-rose-500/10' },
  { regex: /dark:hover:bg-red-900\/[0-9]+/g, replacement: 'dark:hover:bg-rose-500/20' },
  { regex: /dark:border-red-800/g, replacement: 'dark:border-rose-500/20' },
  { regex: /dark:text-red-400/g, replacement: 'dark:text-rose-400' },
  { regex: /dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300/g, replacement: 'dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300' },

  // 3. Status Tag colors
  { regex: /bg-green-50 text-green-700(?!\s*dark:)/g, replacement: 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  { regex: /bg-green-100 text-green-700(?!\s*dark:)/g, replacement: 'bg-green-100 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  { regex: /bg-green-500(?!\s*dark:)/g, replacement: 'bg-green-500 dark:bg-emerald-500' },
  { regex: /bg-yellow-50 text-yellow-700(?!\s*dark:)/g, replacement: 'bg-yellow-50 text-yellow-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  { regex: /bg-yellow-100 text-yellow-700(?!\s*dark:)/g, replacement: 'bg-yellow-100 text-yellow-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  { regex: /bg-yellow-500(?!\s*dark:)/g, replacement: 'bg-yellow-500 dark:bg-amber-500' },
  { regex: /bg-red-50 text-red-700(?!\s*dark:)/g, replacement: 'bg-red-50 text-red-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
  { regex: /bg-red-100 text-red-700(?!\s*dark:)/g, replacement: 'bg-red-100 text-red-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
  { regex: /bg-red-500(?!\s*dark:)/g, replacement: 'bg-red-500 dark:bg-rose-500' },
  { regex: /bg-blue-50 text-blue-700(?!\s*dark:)/g, replacement: 'bg-blue-50 text-blue-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' },
  { regex: /bg-blue-100 text-blue-700(?!\s*dark:)/g, replacement: 'bg-blue-100 text-blue-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' },
  { regex: /bg-slate-100 text-slate-700(?!\s*dark:)/g, replacement: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20' }
];

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply global replacements
  globalReplacements.forEach(rule => {
    content = content.replace(rule.regex, () => rule.replacement);
  });

  // Apply file-specific replacements
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (normalizedPath.endsWith('components/indices/grid-view.tsx')) {
    content = content.replace(
      /'border-2 border-solid border-green-600 bg-green-100\/80 text-green-900 hover:bg-green-100'(?!\s*\+)/g,
      "'border-2 border-solid border-green-600 bg-green-100/80 text-green-900 hover:bg-green-100 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'"
    );

    content = content.replace(
      /'border-2 border-dashed border-blue-600 bg-blue-100\/80 text-blue-900 hover:bg-blue-100'(?!\s*\+)/g,
      "'border-2 border-dashed border-blue-600 bg-blue-100/80 text-blue-900 hover:bg-blue-100 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20'"
    );

    content = content.replace(
      /className="w-8 h-8 rounded border-2 border-amber-500 border-dashed bg-amber-100\/80 flex flex-col items-center justify-center text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:shadow-sm transition-all cursor-pointer"/g,
      'className="w-8 h-8 rounded border-2 border-amber-500 border-dashed bg-amber-100/80 flex flex-col items-center justify-center text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:shadow-sm transition-all cursor-pointer dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-emerald-500/20"'
    );

    content = content.replace(
      /className="flex border-b border-slate-200\/60 bg-amber-50\/40 hover:bg-amber-50\/60 transition-colors"/g,
      'className="flex border-b border-slate-200/60 dark:border-slate-800 bg-amber-50/40 hover:bg-amber-50/60 dark:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors"'
    );
    
    content = content.replace(
      /className="w-\[256px\] px-4 py-4 border-r-2 border-slate-300 flex-shrink-0 sticky left-0 z-10 bg-amber-50"/g,
      'className="w-[256px] px-4 py-4 border-r-2 border-slate-300 dark:border-slate-700 flex-shrink-0 sticky left-0 z-10 bg-amber-50 dark:bg-amber-900/10"'
    );
  } else if (normalizedPath.endsWith('app/cluster-information/page.tsx')) {
    content = content.replace(
      /className="w-3 h-3 rounded border border-solid border-green-600 bg-green-100"/g,
      'className="w-3 h-3 rounded border border-solid border-green-600 bg-green-100 dark:border-emerald-500/50 dark:bg-emerald-500/20"'
    );

    content = content.replace(
      /className="w-3 h-3 rounded border border-dashed border-blue-600 bg-blue-100"/g,
      'className="w-3 h-3 rounded border border-dashed border-blue-600 bg-blue-100 dark:border-sky-500/50 dark:bg-sky-500/20"'
    );

    content = content.replace(
      /className="w-3 h-3 rounded border border-dashed border-amber-500 bg-amber-100"/g,
      'className="w-3 h-3 rounded border border-dashed border-amber-500 bg-amber-100 dark:border-amber-500/50 dark:bg-amber-500/20"'
    );

    content = content.replace(
      /bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/g,
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
    );
  }

  // Clean up any potential doubles
  content = content.replace(/dark:bg-slate-950 dark:bg-slate-950/g, 'dark:bg-slate-950');
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:border-slate-800 dark:border-slate-800/g, 'dark:border-slate-800');
  content = content.replace(/dark:text-slate-50 dark:text-slate-50/g, 'dark:text-slate-50');
  content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
  content = content.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');
  content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
  content = content.replace(/dark:hover:bg-slate-800 dark:hover:bg-slate-800/g, 'dark:hover:bg-slate-800');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated styles in: ${filePath}`);
  }
}

function traverse(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
});

console.log('Dark mode classes applied globally.');
