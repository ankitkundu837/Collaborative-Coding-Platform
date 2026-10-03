const { executeCode } = require("../services/codeExecutionService");

const MAX_CODE_LENGTH = 65536; // 64 KB

const executeController = async (req, res) => {
    try {
        const { language, code, stdin } = req.body;

        // 1. Validate Language
        if (!language || typeof language !== "string") {
            return res.status(400).json({
                success: false,
                message: "A valid programming language is required"
            });
        }

        // 2. Validate Code
        if (!code || typeof code !== "string" || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Source code cannot be empty"
            });
        }

        if (code.length > MAX_CODE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Code size exceeds maximum limit of ${MAX_CODE_LENGTH / 1024} KB`
            });
        }

        const selectedLanguage = language.trim().toLowerCase();

        // 3. Execute Code via Unified Execution Service
        const result = await executeCode({
            language: selectedLanguage,
            sourceCode: code,
            stdin: typeof stdin === "string" ? stdin : ""
        });

        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        console.error("executeController error:", error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Code execution failed"
        });
    }
};

module.exports = {
    executeController
};