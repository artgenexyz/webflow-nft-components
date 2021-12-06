module.exports = {
    webpack: {
        alias: {},
        configure: (webpackConfig, {env, paths}) => {
            const isEnvProduction = env === "production";
            const isEnvDevelopment = env === "development";
            webpackConfig.output.libraryTarget = "umd";
            webpackConfig.output.library = "NFTComponents";
            webpackConfig.output.filename = isEnvProduction
                ? 'static/js/[name].js'
                : isEnvDevelopment && 'static/js/bundle.js';
            // Turn off chunking
            webpackConfig.optimization = {};

            const miniCssPlugin = webpackConfig.plugins.find(
                ({ constructor }) => constructor.name === 'MiniCssExtractPlugin'
            );
            if (miniCssPlugin) {
                miniCssPlugin.options.filename = 'static/css/[name].css';
                miniCssPlugin.options.chunkFilename = 'static/css/[name].css';
            }
            return webpackConfig;
        },
    },
}
