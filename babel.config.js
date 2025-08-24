module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      // IMPORTANT: keep the worklets plugin last
      'react-native-worklets/plugin',
    ],
  };
};
