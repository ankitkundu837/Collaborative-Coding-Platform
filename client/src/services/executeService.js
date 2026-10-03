import api from "./api";

export async function runCode({ language, code, stdin = "" }) {
    const response = await api.post("/execute", {
        language,
        code,
        stdin
    });
    return response.data;
}
