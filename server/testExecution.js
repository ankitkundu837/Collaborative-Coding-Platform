const { executeCode } = require("./services/codeExecutionService");

async function test() {
    console.log("=== Testing Multi-Language Code Execution ===");

    // Test 1: Python
    console.log("\n1. Testing Python Execution...");
    const pyResult = await executeCode({
        language: "python",
        sourceCode: `print("Hello from Python CodeSync!")\nprint(f"Calculation: 7 * 8 = {7 * 8}")`,
        stdin: ""
    });
    console.log("Python Result:", JSON.stringify(pyResult, null, 2));

    // Test 2: JavaScript
    console.log("\n2. Testing JavaScript Execution...");
    const jsResult = await executeCode({
        language: "javascript",
        sourceCode: `const items = [1, 2, 3, 4, 5];\nconsole.log("Sum:", items.reduce((a, b) => a + b, 0));`,
        stdin: ""
    });
    console.log("JavaScript Result:", JSON.stringify(jsResult, null, 2));

    // Test 3: C++
    console.log("\n3. Testing C++ Execution...");
    const cppResult = await executeCode({
        language: "cpp",
        sourceCode: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++ CodeSync!" << endl;\n    return 0;\n}`,
        stdin: ""
    });
    console.log("C++ Result:", JSON.stringify(cppResult, null, 2));

    // Test 4: Java
    console.log("\n4. Testing Java Execution...");
    const javaResult = await executeCode({
        language: "java",
        sourceCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java CodeSync!");\n    }\n}`,
        stdin: ""
    });
    console.log("Java Result:", JSON.stringify(javaResult, null, 2));
}

test().catch(console.error);