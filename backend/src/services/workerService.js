"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const logger_1 = require("../utils/logger");
class WorkerService {
    async compileAndRun(input) {
        const fileName = input.filename ?? "solution.py";
        const timeoutMs = input.timeoutMs ?? 4000;
        const workingDir = await (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "orchestrator-worker-"));
        const filePath = (0, node_path_1.join)(workingDir, fileName);
        await (0, promises_1.writeFile)(filePath, input.code, "utf8");
        logger_1.logger.info("Worker: starting compile", { filePath, timeoutMs });
        const compileResult = await this.runProcess("python3", ["-m", "py_compile", filePath], timeoutMs);
        if (compileResult.exitCode !== 0) {
            logger_1.logger.warn("Worker: compilation failed", { exitCode: compileResult.exitCode });
            return {
                compile: { success: false, exitCode: compileResult.exitCode, stderr: compileResult.stderr },
                run: { success: false, exitCode: compileResult.exitCode, stalled: compileResult.timedOut, stdout: [], stderr: compileResult.stderr },
            };
        }
        logger_1.logger.info("Worker: compilation succeeded, starting run");
        const runResult = await this.runProcess("python3", [filePath, ...(input.args ?? [])], timeoutMs);
        logger_1.logger.info("Worker: run complete", { exitCode: runResult.exitCode, timedOut: runResult.timedOut });
        return {
            compile: { success: true, exitCode: compileResult.exitCode, stderr: compileResult.stderr },
            run: {
                success: runResult.exitCode === 0 && !runResult.timedOut,
                exitCode: runResult.exitCode,
                stalled: runResult.timedOut,
                stdout: runResult.stdout,
                stderr: runResult.stderr,
            },
        };
    }
    runProcess(command, args, timeoutMs) {
        return new Promise((resolve, reject) => {
            const stdout = [];
            const stderr = [];
            let timedOut = false;
            const child = (0, node_child_process_1.spawn)(command, args, { stdio: ["ignore", "pipe", "pipe"] });
            const parseLines = (streamName, payload) => {
                const lines = payload.toString("utf8").split(/\r?\n/).map((l) => l.trimEnd()).filter(Boolean)
                    .map((line) => ({ stream: streamName, line, timestamp: new Date().toISOString() }));
                if (streamName === "stdout")
                    stdout.push(...lines);
                else
                    stderr.push(...lines);
            };
            child.stdout?.on("data", (p) => parseLines("stdout", p));
            child.stderr?.on("data", (p) => parseLines("stderr", p));
            const timeout = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
            child.on("error", (e) => { clearTimeout(timeout); reject(e); });
            child.on("close", (code) => { clearTimeout(timeout); resolve({ exitCode: code ?? 1, stdout, stderr, timedOut }); });
        });
    }
}
exports.WorkerService = WorkerService;
