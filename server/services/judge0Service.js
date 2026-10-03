const axios = require("axios");

const languageMap = require("../utils/languageMap");


const JUDGE0_URL =
    process.env.JUDGE0_API_URL ||
    "https://judge0-ce.p.rapidapi.com";


const JUDGE0_HEADERS = {

    "Content-Type": "application/json",

    "X-RapidAPI-Key":
        process.env.JUDGE0_API_KEY,

    "X-RapidAPI-Host":
        "judge0-ce.p.rapidapi.com"

};


const sleep = (ms) =>
    new Promise(
        resolve => setTimeout(resolve, ms)
    );


// =====================================
// EXECUTE CODE
// =====================================

async function executeCode({
    language,
    sourceCode,
    stdin = ""
}) {

    // ---------------------------------
    // NORMALIZE LANGUAGE
    // ---------------------------------

    const normalizedLanguage =
        language
            .trim()
            .toLowerCase();


    // ---------------------------------
    // GET JUDGE0 LANGUAGE ID
    // ---------------------------------

    const languageId =
        languageMap[normalizedLanguage];


    if (!languageId) {

        throw new Error(
            `Unsupported language: ${language}`
        );

    }


    // ---------------------------------
    // SUBMIT CODE
    // ---------------------------------

    const submissionResponse =
        await axios.post(

            `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,

            {

                language_id: languageId,

                source_code: sourceCode,

                stdin

            },

            {

                headers: JUDGE0_HEADERS

            }

        );


    const token =
        submissionResponse.data.token;


    if (!token) {

        throw new Error(
            "Judge0 did not return a submission token"
        );

    }


    // ---------------------------------
    // POLL FOR RESULT
    // ---------------------------------

    const maxAttempts = 20;

    const pollingDelay = 1000;


    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

        await sleep(pollingDelay);


        const resultResponse =
            await axios.get(

                `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,

                {

                    headers: JUDGE0_HEADERS

                }

            );


        const result =
            resultResponse.data;


        // ---------------------------------
        // STATUS:
        // 1 = In Queue
        // 2 = Processing
        // 3+ = Finished
        // ---------------------------------

        if (
            result.status &&
            result.status.id >= 3
        ) {

            return {

                stdout:
                    result.stdout || "",

                stderr:
                    result.stderr || "",

                compileOutput:
                    result.compile_output || "",

                message:
                    result.message || "",

                status:
                    result.status,

                time:
                    result.time || null,

                memory:
                    result.memory || null

            };

        }

    }


    // ---------------------------------
    // EXECUTION TOOK TOO LONG
    // ---------------------------------

    throw new Error(
        "Code execution timed out while waiting for Judge0"
    );

}


module.exports = executeCode;