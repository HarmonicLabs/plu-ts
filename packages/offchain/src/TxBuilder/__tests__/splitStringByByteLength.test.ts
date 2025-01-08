import { splitStringByByteLength } from "../TxBuilder"

const exampleString = "Hello, 🌍! This is a test.";

test(exampleString, () => {

    const maxChunkBytes = 10;
    const result = splitStringByByteLength(exampleString, maxChunkBytes);
    expect(result).toEqual(["Hello, ", "🌍! This", " is a test", "."]);
})