import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { StructuredLogLine, WorkerExecutionResult } from "../types/orchestration";

interface WorkerInput {
  code: string;
  filename?: string;
  args?: string[];
  timeoutMs?: number;
}

interface ProcessResult {
  exitCode: number;
  stdout: StructuredLogLine[];
  stderr: StructuredLogLine[];
  timedOut: boolean;
}

export class WorkerService {
  public async compileAndRun(input: WorkerInput): Promise<WorkerExecutionResult> {
    const fileName = input.filename ?? "solution.py";
    const timeoutMs = input.timeoutMs ?? 4000;

    const workingDir = await mkdtemp(join(tmpdir(), "orchestrator-worker-"));
    const filePath = join(workingDir, fileName);
    await writeFile(filePath, input.code, "utf8");

    const compileResult = await this.runProcess("python3", ["-m", "py_compile", filePath], timeoutMs);
    if (compileResult.exitCode !== 0) {
      return {
        compile: {
          success: false,
          exitCode: compileResult.exitCode,
          stderr: compileResult.stderr,
        },
        run: {
          success: false,
          exitCode: compileResult.exitCode,
          stalled: compileResult.timedOut,
          stdout: [],
          stderr: compileResult.stderr,
        },
      };
    }

    const runResult = await this.runProcess("python3", [filePath, ...(input.args ?? [])], timeoutMs);

    return {
      compile: {
        success: true,
        exitCode: compileResult.exitCode,
        stderr: compileResult.stderr,
      },
      run: {
        success: runResult.exitCode === 0 && !runResult.timedOut,
        exitCode: runResult.exitCode,
        stalled: runResult.timedOut,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
      },
    };
  }

  private async runProcess(command: string, args: string[], timeoutMs: number): Promise<ProcessResult> {
    return new Promise<ProcessResult>((resolve, reject) => {
      const stdout: StructuredLogLine[] = [];
      const stderr: StructuredLogLine[] = [];
      let timedOut = false;

      const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });

      const onData = (stream: "stdout" | "stderr", payload: Buffer): void => {
        const lines = payload
          .toString("utf8")
          .split(/\r?\n/)
          .map((line) => line.trimEnd())
          .filter((line) => line.length > 0)
          .map((line) => ({ stream, line, timestamp: new Date().toISOString() }));

        if (stream === "stdout") {
          stdout.push(...lines);
        } else {
          stderr.push(...lines);
        }
      };

      child.stdout?.on("data", (payload: Buffer) => onData("stdout", payload));
      child.stderr?.on("data", (payload: Buffer) => onData("stderr", payload));

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, timeoutMs);

      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      child.on("close", (code) => {
        clearTimeout(timeout);
        resolve({
          exitCode: code ?? 1,
          stdout,
          stderr,
          timedOut,
        });
      });
    });
  }
}
