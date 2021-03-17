require('dotenv').config();
const tinify = require('tinify');
tinify.key = process.env.TINIFY_API_KEY;

function tinifyApi(source, target, resizeOptions) {
    return resizeOptions
        ? tinify
            .fromFile(source)
            .resize(resizeOptions)
            .toFile(target)
        : tinify
            .fromFile(source)
            .toFile(target);
}

module.exports = tinifyApi;