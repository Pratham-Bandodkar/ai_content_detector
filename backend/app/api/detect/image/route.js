import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const PIPELINE_PATH = path.join(process.cwd(), 'pipeline.py');
const PYTHON_EXEC = 'python';

function runPipeline(type, filePath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_EXEC, [PIPELINE_PATH, '--type', type, '--input', filePath], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Pipeline exited with code ${code}. stderr: ${stderr}`));
        return;
      }
      try {
        const jsonMatch = stdout.match(/(\{[\s\S]*\})\s*$/);
        if (!jsonMatch) throw new Error('No JSON found in output');
        resolve(JSON.parse(jsonMatch[1]));
      } catch (e) {
        reject(new Error(`Failed to parse pipeline output: ${stdout} | err: ${e.message}`));
      }
    });

    proc.on('error', reject);
  });
}

export async function POST(request) {
  let tmpPath = null;
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Save to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    tmpPath = path.join(os.tmpdir(), `upload_${Date.now()}.${ext}`);
    fs.writeFileSync(tmpPath, buffer);

    const result = await runPipeline('image', tmpPath);

    // Add file metadata
    result.filename = file.name;
    result.fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
}
