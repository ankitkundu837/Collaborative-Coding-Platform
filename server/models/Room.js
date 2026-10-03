const mongoose = require("mongoose");

const DEFAULT_STARTER_CODE = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to CodeSync!" << endl;
    return 0;
}`,
    python: `# Welcome to CodeSync!
def main():
    print("Hello from Python!")

if __name__ == "__main__":
    main()`,
    javascript: `// Welcome to CodeSync!
function greet() {
    console.log("Hello from JavaScript!");
}

greet();`,
    typescript: `// Welcome to CodeSync!
const message: string = "Hello from TypeScript!";
console.log(message);`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}`,
    rust: `fn main() {
    println!("Hello from Rust!");
}`,
    csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from C#!");
    }
}`
};

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        title: {
            type: String,
            default: "Collaborative Session",
            trim: true
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        language: {
            type: String,
            enum: ["cpp", "python", "javascript", "typescript", "java", "go", "rust", "csharp"],
            default: "cpp"
        },
        code: {
            type: String,
            default: DEFAULT_STARTER_CODE.cpp
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = {
    Room: mongoose.model("Room", roomSchema),
    DEFAULT_STARTER_CODE
};
