export default function simpleCfgPlugin(flags = {}) {
  return {
    name: 'simple-cfg',
    transform(code, id) {
      // Matches: /* cfg:featureName */ ... /* endcfg */
      return {
        code: code.replace(
          /\/\*\s*cfg:(\w+)\s*\*\/[\s\S]*?\/\*\s*endcfg\s*\*\//g,
          (match, feature) => flags[feature] ? match : ''
        ),
        map: null
      };
    }
  };
}