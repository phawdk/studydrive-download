// rollup-plugin-manifest.js
import fs from 'fs';

/**
 * @typedef {Object} EditJsonOptions
 * @property {string} inputPath - The path to the input JSON file.
 * @property {string} outputPath - The path to the output JSON file.
 * @property {function(Object): Object} editFn - A function that takes the JSON object and returns the modified JSON object.
 */

/**
 * Rollup plugin to edit a JSON file.
 * @param {EditJsonOptions} options - The options for the plugin.
 * @returns {Object} The Rollup plugin object.
 */
export default function editJson(options) {
  return {
    name: 'edit-json-plugin',
    writeBundle: async function () {
      const { inputPath, outputPath, editFn } = options;

      // Read the existing manifest file
      const fileContent = fs.readFileSync(inputPath, 'utf-8');
      const fileJson = JSON.parse(fileContent);

      // Call the edit function to modify the JSON
      const newJson = editFn(fileJson);

      // Write the modified manifest to the output path
      fs.writeFileSync(outputPath, JSON.stringify(newJson, null, 2));
      console.log(`Edited ${inputPath} to: ${outputPath}`);
    }
  };
}
