const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Limits the APK to arm64-v8a only.
 * Reduces APK size from ~77 MB to ~35-40 MB.
 * Covers 95%+ of modern Android devices (2017+).
 */
const withAbiSplits = (config) => {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // Only add if not already present
    if (!contents.includes('splits {')) {
      config.modResults.contents = contents.replace(
        /android \{/,
        `android {
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "arm64-v8a"
        }
    }
`
      );
    }

    return config;
  });
};

module.exports = withAbiSplits;
