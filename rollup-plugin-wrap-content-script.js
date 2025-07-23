export default function wrapContentScript() {
  return {
    name: "wrapContentScript",
    renderChunk(code, chunk) {
      if (chunk.isEntry) {
        const wrappedCode = `export const contentScript = (scriptParams) => {\n${code}\n};`;
        return wrappedCode;
      }
      return code;
    },
  };
};
