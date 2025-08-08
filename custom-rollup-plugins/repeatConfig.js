export default (files, config) => {
  return files.map((x) => ({
    input: x,
    ...config,
  }));
};
