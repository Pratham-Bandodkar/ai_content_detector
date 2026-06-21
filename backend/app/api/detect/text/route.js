import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const PIPELINE_PATH = path.join(process.cwd(), 'pipeline.py');
const PYTHON_EXEC = 'python';

function runPipeline(type, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_EXEC, [PIPELINE_PATH, '--type', type, '--input', input], {
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
        // Find the last JSON object in stdout (stderr TF warnings may pollute)
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
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters.' },
        { status: 400 }
      );
    }

    const result = await runPipeline('text', text.trim());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
