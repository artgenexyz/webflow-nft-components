module.exports = {
    webpack: {
        alias: {},
        configure: (webpackConfig, {env, paths}) => {
            const isEnvProduction = env === "production";
            const isEnvDevelopment = env === "development";
            webpackConfig.output.library = "NFTComponents";
            webpackConfig.output.filename = isEnvProduction
                ? 'static/js/[name].js'
                : isEnvDevelopment && 'static/js/bundle.js';
            webpackConfig.output.chunkFilename = isEnvProduction
                ? 'static/js/[name].js'
                : isEnvDevelopment && 'static/js/[name].js';
            // webpackConfig.resolve.plugins = webpackConfig.resolve.plugins
            //     .filter(p => p.name !== 'ModuleScopePlugin')
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            );

            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
            return webpackConfig;
        }
    },
}
