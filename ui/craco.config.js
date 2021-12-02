module.exports = {
    webpack: {
        alias: {},
        configure: (webpackConfig, {env, paths}) => {
            const isEnvProduction = env === "production";
            const isEnvDevelopment = env === "development";
            webpackConfig.output.library = "UIComponents";
            webpackConfig.output.filename = isEnvProduction
                ? 'static/js/[name].js'
                : isEnvDevelopment && 'static/js/bundle.js';
            webpackConfig.output.chunkFilename = isEnvProduction
                ? 'static/js/[name].js'
                : isEnvDevelopment && 'static/js/[name].js';
            return webpackConfig;
        }
    },
}
