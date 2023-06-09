const webpack = require('webpack');

module.exports = (config) => {
  const AM_URL = process.env.AM_URL;
  const API_URL = process.env.API_URL;
  const DEBUGGER_OFF = process.env.DEBUGGER_OFF;
  const JOURNEY_LOGIN = process.env.JOURNEY_LOGIN;
  const JOURNEY_REGISTER = process.env.JOURNEY_REGISTER;
  const WEB_OAUTH_CLIENT = process.env.WEB_OAUTH_CLIENT;
  const REALM_PATH = process.env.REALM_PATH;

  config.plugins.push(
    new webpack.DefinePlugin({
      // Inject all the environment variable into the Webpack build
      'process.env.AM_URL': JSON.stringify(AM_URL),
      'process.env.API_URL': JSON.stringify(API_URL),
      'process.env.DEBUGGER_OFF': JSON.stringify(DEBUGGER_OFF),
      'process.env.JOURNEY_LOGIN': JSON.stringify(JOURNEY_LOGIN),
      'process.env.JOURNEY_REGISTER': JSON.stringify(JOURNEY_REGISTER),
      'process.env.WEB_OAUTH_CLIENT': JSON.stringify(WEB_OAUTH_CLIENT),
      'process.env.REALM_PATH': JSON.stringify(REALM_PATH),
    }),
  );
  const conf = {
    ...config,
    devServer: {
      ...config.devServer,
      client: {
        logging: 'none',
        overlay: false,
        webSocketURL: {
          port: 443,
        },
      },
      allowedHosts: ['myforgebucket.s3-website-us-east-1.amazonaws.com', 'https://sdkapp.example.com:8443'],
      compress: true,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      },
      server: 'https',
    },
    stats: {
      warnings: false,
    },
    devtool: 'source-map',
    plugins: config.plugins.slice(1),
  };
  console.log(config);
  return conf;
};
