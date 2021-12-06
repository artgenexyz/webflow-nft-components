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
            // Remove ModuleScopePlugin
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            );
            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
            return webpackConfig;
        }
    },
}
