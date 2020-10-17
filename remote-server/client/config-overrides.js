module.exports = function override(config, env) {
    config.module.rules[config.module.rules.length - 1].oneOf.splice(1, 0, {
      test: /\.xlsx$/i,
      use: 'arraybuffer-loader',
    });

    (config.externals = config.externals || {}).ExcelJS = 'ExcelJS';
    return config;
}
