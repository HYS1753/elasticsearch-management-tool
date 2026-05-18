import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const command = process.argv[2] || 'dev'; // 'dev' or 'start'

const envPath = path.join(__dirname, '../.env.local');
const envDefaultPath = path.join(__dirname, '../.env');
let port = '3000';

function parseEnv(filePath: string): string | null {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*NEXT_PUBLIC_APP_PORT\s*=\s*(.*)$/);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return null;
}

const localPort = parseEnv(envPath);
const defaultPort = parseEnv(envDefaultPath);
port = localPort || defaultPort || process.env.NEXT_PUBLIC_APP_PORT || process.env.PORT || '3000';

console.log(`🚀 Starting Next.js in '${command}' mode on port ${port}...`);

// Spawn Next.js process with the detected port
const child = spawn('npx', ['next', command, '-p', port], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port }
});

child.on('exit', (code: number | null) => {
  process.exit(code ?? 0);
});
