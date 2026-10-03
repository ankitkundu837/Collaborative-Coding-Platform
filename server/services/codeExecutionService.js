const axios = require("axios");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const languageMap = require("../utils/languageMap");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. RapidAPI / Self-Hosted Judge0 Engine
 */
async function executeViaJudge0(language, sourceCode, stdin) {
    const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
    const apiKey = process.env.JUDGE0_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error("Judge0 API key not configured");
    }

    const languageId = languageMap[language];
    if (!languageId) {
        throw new Error(`Language "${language}" is not supported by Judge0.`);
    }

    const isRapidAPI = JUDGE0_URL.includes("rapidapi.com");
    const headers = {
        "Content-Type": "application/json",
        ...(isRapidAPI && {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": new URL(JUDGE0_URL).hostname
        })
    };

    const submissionResponse = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
            language_id: languageId,
            source_code: sourceCode,
            stdin: stdin || ""
        },
        { headers, timeout: 15000 }
    );

    let result = submissionResponse.data;

    if (result.status && result.status.id < 3 && result.token) {
        const token = result.token;
        for (let attempt = 0; attempt < 10; attempt++) {
            await sleep(1000);
            const pollResponse = await axios.get(
                `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
                { headers, timeout: 5000 }
            );
            result = pollResponse.data;
            if (result.status && result.status.id >= 3) break;
        }
    }

    return {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compileOutput: result.compile_output || "",
        message: result.message || "",
        status: {
            id: result.status?.id || 3,
            description: result.status?.description || "Accepted"
        },
        time: result.time ? `${result.time}s` : null,
        memory: result.memory ? `${result.memory} KB` : null
    };
}

/**
 * Helper to run a spawned child process with stdin and timeout
 */
function runProcess(cmd, args, stdin, timeoutMs, cleanup, startTime, resolve) {
    let stdout = "";
    let stderr = "";
    let isSettled = false;

    let child;
    try {
        child = spawn(cmd, args, { timeout: timeoutMs, shell: true });
    } catch (spawnErr) {
        cleanup();
        return resolve({
            stdout: "",
            stderr: spawnErr.message,
            compileOutput: "",
            message: "Failed to spawn process",
            status: { id: 13, description: "Runtime Error" },
            time: null,
            memory: null
        });
    }

    if (stdin && child.stdin) {
        try {
            child.stdin.write(stdin);
            child.stdin.end();
        } catch (e) {}
    }

    child.stdout?.on("data", (d) => {
        stdout += d.toString();
    });

    child.stderr?.on("data", (d) => {
        stderr += d.toString();
    });

    const timer = setTimeout(() => {
        if (!isSettled) {
            isSettled = true;
            try {
                if (process.platform === "win32") {
                    exec(`taskkill /pid ${child.pid} /T /F`);
                } else {
                    child.kill("SIGKILL");
                }
            } catch (e) {}
            cleanup();
            resolve({
                stdout,
                stderr: "Time Limit Exceeded (Execution timed out).",
                compileOutput: "",
                message: "Process timed out",
                status: { id: 5, description: "Time Limit Exceeded" },
                time: `${timeoutMs / 1000}s`,
                memory: null
            });
        }
    }, timeoutMs);

    child.on("close", (code) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        cleanup();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (code === 0) {
            resolve({
                stdout,
                stderr,
                compileOutput: "",
                message: "",
                status: { id: 3, description: "Accepted" },
                time: `${duration}s`,
                memory: null
            });
        } else {
            resolve({
                stdout,
                stderr: stderr || `Process exited with error code ${code}`,
                compileOutput: "",
                message: `Exit Code: ${code}`,
                status: { id: 11, description: "Runtime Error" },
                time: `${duration}s`,
                memory: null
            });
        }
    });

    child.on("error", (err) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        cleanup();

        resolve({
            stdout,
            stderr: err.message,
            compileOutput: "",
            message: err.message,
            status: { id: 13, description: "Runtime Error" },
            time: null,
            memory: null
        });
    });
}

/**
 * 2. Local Isolated Runtime Sandbox (Node.js / Python / C++ / Java / etc.)
 */
async function executeLocalSandbox(language, sourceCode, stdin = "") {
    return new Promise((resolve) => {
        const tempId = crypto.randomUUID();
        const tempDir = path.join(__dirname, "../temp", tempId);

        try {
            fs.mkdirSync(tempDir, { recursive: true });
        } catch (err) {
            return resolve({
                stdout: "",
                stderr: "Failed to allocate temporary execution directory.",
                compileOutput: "",
                message: err.message,
                status: { id: 13, description: "System Error" },
                time: null,
                memory: null
            });
        }

        const cleanup = () => {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (e) {}
        };

        const startTime = Date.now();
        let cmd = "";
        let args = [];
        let filePath = "";

        if (language === "javascript") {
            filePath = path.join(tempDir, "main.js");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            cmd = "node";
            args = [`"${filePath}"`];
            runProcess(cmd, args, stdin, 6000, cleanup, startTime, resolve);
        } else if (language === "python") {
            filePath = path.join(tempDir, "main.py");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            // On Windows, 'py' is the official launcher that bypasses Microsoft Store stubs
            cmd = process.platform === "win32" ? "py" : "python3";
            args = [`"${filePath}"`];
            runProcess(cmd, args, stdin, 6000, cleanup, startTime, resolve);
        } else if (language === "cpp") {
            filePath = path.join(tempDir, "main.cpp");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            const outPath = path.join(tempDir, process.platform === "win32" ? "main.exe" : "main");

            // Compile first with g++
            exec(`g++ "${filePath}" -o "${outPath}"`, { timeout: 8000 }, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    cleanup();
                    return resolve({
                        stdout: "",
                        stderr: compileStderr || compileErr.message,
                        compileOutput: compileStderr || compileErr.message,
                        message: "Compilation Failed",
                        status: { id: 6, description: "Compilation Error" },
                        time: null,
                        memory: null
                    });
                }

                // Run compiled binary
                runProcess(`"${outPath}"`, [], stdin, 5000, cleanup, startTime, resolve);
            });
        } else if (language === "java") {
            // Modern Java (11+) can run single-file source code directly: java Main.java
            filePath = path.join(tempDir, "Main.java");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            cmd = "java";
            args = [`"${filePath}"`];
            runProcess(cmd, args, stdin, 8000, cleanup, startTime, resolve);
        } else if (language === "typescript") {
            filePath = path.join(tempDir, "main.ts");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            cmd = "npx";
            args = ["--yes", "tsx", `"${filePath}"`];
            runProcess(cmd, args, stdin, 8000, cleanup, startTime, resolve);
        } else if (language === "go") {
            filePath = path.join(tempDir, "main.go");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            cmd = "go";
            args = ["run", `"${filePath}"`];
            runProcess(cmd, args, stdin, 8000, cleanup, startTime, resolve);
        } else if (language === "rust") {
            filePath = path.join(tempDir, "main.rs");
            fs.writeFileSync(filePath, sourceCode, "utf8");
            const outPath = path.join(tempDir, process.platform === "win32" ? "main.exe" : "main");

            exec(`rustc "${filePath}" -o "${outPath}"`, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    cleanup();
                    return resolve({
                        stdout: "",
                        stderr: compileStderr || compileErr.message,
                        compileOutput: compileStderr || compileErr.message,
                        message: "Rust Compilation Failed",
                        status: { id: 6, description: "Compilation Error" },
                        time: null,
                        memory: null
                    });
                }
                runProcess(`"${outPath}"`, [], stdin, 5000, cleanup, startTime, resolve);
            });
        } else {
            cleanup();
            return resolve({
                stdout: "",
                stderr: `Execution for language "${language}" is not available in local mode. Please configure a Judge0 API key in server/.env for cloud execution.`,
                compileOutput: "",
                message: "Language requires Judge0 service",
                status: { id: 13, description: "External Service Required" },
                time: null,
                memory: null
            });
        }
    });
}

/**
 * Main Unified Execution Entrypoint
 */
async function executeCode({ language, sourceCode, stdin = "" }) {
    const normalizedLanguage = (language || "").trim().toLowerCase();

    // 1. If Judge0 API is configured and not the default placeholder, execute via Judge0
    if (process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_KEY !== "YOUR_API_KEY") {
        try {
            return await executeViaJudge0(normalizedLanguage, sourceCode, stdin);
        } catch (judgeErr) {
            console.warn("Judge0 execution failed, trying local sandbox:", judgeErr.message);
        }
    }

    // 2. Local Isolated Sandbox Fallback
    return await executeLocalSandbox(normalizedLanguage, sourceCode, stdin);
}

module.exports = {
    executeCode
};
