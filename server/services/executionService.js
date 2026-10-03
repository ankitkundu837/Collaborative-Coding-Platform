const { spawn } = require("child_process");

const fs = require("fs");

const path = require("path");

const crypto = require("crypto");


// =====================================================
// CONSTANTS
// =====================================================

const COMPILE_TIMEOUT = 10000;

const EXECUTION_TIMEOUT = 10000;


// =====================================================
// LANGUAGE CONFIGURATION
// =====================================================

const LANGUAGE_CONFIGS = {

    cpp: {

        image: "gcc:latest",

        fileName: "main.cpp",

        compileCommand:
            "g++ main.cpp -o main",

        runCommand:
            "./main"

    },


    python: {

        image: "python:3.12-alpine",

        fileName: "main.py",

        // Checks Python syntax before execution
        compileCommand:
            "python -m py_compile main.py",

        runCommand:
            "python main.py"

    },


    javascript: {

        image: "node:22-alpine",

        fileName: "main.js",

        // Checks JavaScript syntax before execution
        compileCommand:
            "node --check main.js",

        runCommand:
            "node main.js"

    }

};


// =====================================================
// RUN DOCKER PROCESS
// =====================================================

function runDocker({

    dockerPath,

    image,

    command,

    stdin = "",

    timeout

}) {

    return new Promise((resolve) => {

        let stdout = "";

        let stderr = "";

        let finished = false;

        let timeoutTimer = null;


        // ---------------------------------------------
        // FINISH ONLY ONCE
        // ---------------------------------------------

        function finish(result) {

            if (finished) {

                return;

            }

            finished = true;


            if (timeoutTimer) {

                clearTimeout(
                    timeoutTimer
                );

            }


            resolve(result);

        }


        // ---------------------------------------------
        // DOCKER ARGUMENTS
        // ---------------------------------------------

        const dockerArgs = [

            "run",

            "-i",

            "--rm",


            // Memory limit
            "--memory=128m",


            // CPU limit
            "--cpus=0.5",


            // Process limit
            "--pids-limit=64",


            // Disable internet access
            "--network=none",


            // Mount temporary directory
            "--mount",

            `type=bind,source=${dockerPath},target=/app`,


            // Working directory
            "--workdir",

            "/app",


            // Language-specific Docker image
            image,


            // Use sh because Alpine images
            // don't include bash by default
            "sh",

            "-c",


            // Command
            command

        ];


        console.log(

            "Docker command:",

            `docker ${dockerArgs.join(" ")}`

        );


        // ---------------------------------------------
        // START DOCKER
        // ---------------------------------------------

        const dockerProcess = spawn(

            "docker",

            dockerArgs

        );


        // ---------------------------------------------
        // CAPTURE STDOUT
        // ---------------------------------------------

        dockerProcess.stdout.on(

            "data",

            (data) => {

                stdout += data.toString();

            }

        );


        // ---------------------------------------------
        // CAPTURE STDERR
        // ---------------------------------------------

        dockerProcess.stderr.on(

            "data",

            (data) => {

                stderr += data.toString();

            }

        );


        // ---------------------------------------------
        // SEND STDIN
        // ---------------------------------------------

        if (stdin) {

            console.log(

                "Sending stdin:",

                JSON.stringify(stdin)

            );


            dockerProcess.stdin.write(
                stdin
            );

        }


        dockerProcess.stdin.end();


        // ---------------------------------------------
        // TIMEOUT
        // ---------------------------------------------

        timeoutTimer = setTimeout(() => {

            console.log(
                "Docker process timed out"
            );


            dockerProcess.kill(
                "SIGTERM"
            );


            finish({

                timedOut: true,

                stdout,

                stderr,

                exitCode: null

            });

        }, timeout);


        // ---------------------------------------------
        // DOCKER FINISHED
        // ---------------------------------------------

        dockerProcess.on(

            "close",

            (exitCode, signal) => {

                if (finished) {

                    return;

                }


                finish({

                    timedOut: false,

                    stdout,

                    stderr,

                    exitCode,

                    signal:
                        signal || null

                });

            }

        );


        // ---------------------------------------------
        // DOCKER SYSTEM ERROR
        // ---------------------------------------------

        dockerProcess.on(

            "error",

            (error) => {

                finish({

                    systemError: true,

                    error:
                        error.message,

                    stdout,

                    stderr,

                    exitCode: null

                });

            }

        );

    });

}


// =====================================================
// EXECUTE CODE
// =====================================================

function executeCode(

    code,

    language = "cpp",

    stdin = ""

) {

    return new Promise(

        async (resolve) => {

            // -----------------------------------------
            // VALIDATE LANGUAGE
            // -----------------------------------------

            const config =
                LANGUAGE_CONFIGS[language];


            if (!config) {

                resolve({

                    success: false,

                    status:
                        "UNSUPPORTED_LANGUAGE",

                    stdout: "",

                    stderr:
                        `Language "${language}" is not supported.`,

                    exitCode: null

                });

                return;

            }


            const executionId =
                crypto.randomUUID();


            const executionDir =
                path.join(

                    __dirname,

                    "../temp",

                    executionId

                );


            // -----------------------------------------
            // CLEANUP
            // -----------------------------------------

            function cleanup() {

                try {

                    fs.rmSync(

                        executionDir,

                        {

                            recursive: true,

                            force: true

                        }

                    );

                }

                catch (error) {

                    console.error(

                        "Cleanup error:",

                        error

                    );

                }

            }


            try {

                // =====================================
                // CREATE TEMP DIRECTORY
                // =====================================

                fs.mkdirSync(

                    executionDir,

                    {

                        recursive: true

                    }

                );


                console.log(

                    "Execution directory:",

                    executionDir

                );


                console.log(

                    "Selected language:",

                    language

                );


                // =====================================
                // WRITE SOURCE FILE
                // =====================================

                const sourceFile =
                    path.join(

                        executionDir,

                        config.fileName

                    );


                fs.writeFileSync(

                    sourceFile,

                    code,

                    "utf8"

                );


                // =====================================
                // WINDOWS → DOCKER PATH
                // =====================================

                const dockerPath =
                    executionDir.replace(

                        /\\/g,

                        "/"

                    );


                console.log(

                    "Docker mount path:",

                    dockerPath

                );


                // =====================================
                // STEP 1: COMPILE / SYNTAX CHECK
                // =====================================

                console.log(
                    "Starting compilation/syntax check..."
                );


                const compileResult =
                    await runDocker({

                        dockerPath,

                        image:
                            config.image,

                        command:
                            config.compileCommand,

                        stdin: "",

                        timeout:
                            COMPILE_TIMEOUT

                    });


                console.log(

                    "Compilation finished:",

                    compileResult

                );


                // =====================================
                // COMPILATION TIMEOUT
                // =====================================

                if (
                    compileResult.timedOut
                ) {

                    cleanup();


                    resolve({

                        success: false,

                        status:
                            "COMPILATION_TIMEOUT",

                        stdout:
                            compileResult.stdout,

                        stderr:
                            compileResult.stderr,

                        exitCode: null

                    });

                    return;

                }


                // =====================================
                // DOCKER SYSTEM ERROR
                // =====================================

                if (
                    compileResult.systemError
                ) {

                    cleanup();


                    resolve({

                        success: false,

                        status:
                            "SYSTEM_ERROR",

                        stdout:
                            compileResult.stdout,

                        stderr:
                            compileResult.stderr,

                        error:
                            compileResult.error,

                        exitCode: null

                    });

                    return;

                }


                // =====================================
                // COMPILATION / SYNTAX ERROR
                // =====================================

                if (
                    compileResult.exitCode !== 0
                ) {

                    cleanup();


                    resolve({

                        success: false,

                        status:
                            "COMPILATION_ERROR",

                        stdout:
                            compileResult.stdout,

                        stderr:
                            compileResult.stderr,

                        exitCode:
                            compileResult.exitCode

                    });

                    return;

                }


                // =====================================
                // STEP 2: EXECUTE PROGRAM
                // =====================================

                console.log(
                    "Compilation/syntax check successful."
                );


                console.log(
                    "Starting program..."
                );


                const executionResult =
                    await runDocker({

                        dockerPath,

                        image:
                            config.image,

                        command:
                            config.runCommand,

                        stdin,

                        timeout:
                            EXECUTION_TIMEOUT

                    });


                console.log(

                    "Program execution finished:",

                    executionResult

                );


                // =====================================
                // EXECUTION TIMEOUT
                // =====================================

                if (
                    executionResult.timedOut
                ) {

                    cleanup();


                    resolve({

                        success: false,

                        status:
                            "TIME_LIMIT_EXCEEDED",

                        stdout:
                            executionResult.stdout,

                        stderr:
                            executionResult.stderr,

                        exitCode: null

                    });

                    return;

                }


                // =====================================
                // DOCKER SYSTEM ERROR
                // =====================================

                if (
                    executionResult.systemError
                ) {

                    cleanup();


                    resolve({

                        success: false,

                        status:
                            "SYSTEM_ERROR",

                        stdout:
                            executionResult.stdout,

                        stderr:
                            executionResult.stderr,

                        error:
                            executionResult.error,

                        exitCode: null

                    });

                    return;

                }


                // =====================================
                // PROGRAM SUCCESS
                // =====================================

                if (
                    executionResult.exitCode === 0
                ) {

                    cleanup();


                    resolve({

                        success: true,

                        status:
                            "SUCCESS",

                        stdout:
                            executionResult.stdout,

                        stderr:
                            executionResult.stderr,

                        exitCode: 0

                    });

                    return;

                }


                // =====================================
                // RUNTIME ERROR
                // =====================================

                cleanup();


                resolve({

                    success: false,

                    status:
                        "RUNTIME_ERROR",

                    stdout:
                        executionResult.stdout,

                    stderr:
                        executionResult.stderr,

                    exitCode:
                        executionResult.exitCode,

                    signal:
                        executionResult.signal

                });

            }


            catch (error) {

                cleanup();


                resolve({

                    success: false,

                    status:
                        "SYSTEM_ERROR",

                    stdout: "",

                    stderr: "",

                    error:
                        error.message,

                    exitCode: null

                });

            }

        }

    );

}


module.exports = executeCode;