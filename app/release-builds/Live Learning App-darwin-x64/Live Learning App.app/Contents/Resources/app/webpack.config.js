var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: {
        livelearning: "./indexwp.js",
    },

    output: {
        filename: "[name].bundle.js"
    },
    resolve: {
        modules: ['node_modules'],
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: "vendor.js", filename: "vendor.bundle.js" })
    ]

};