const s = "foobar";
const bytes = [...Buffer.from(s)];
console.log("bytes: ", JSON.stringify(bytes).length)

console.log("base64 representation: ", Buffer.from(s).toString('base64').length)