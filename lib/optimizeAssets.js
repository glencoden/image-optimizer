const path = require('path');
const fs = require('fs');
const tinifyApi = require('./tinifyApi');
const { hasFreeApiCalls, addCallCount } = require('../statistics/tinifyApi/manageCallCount');

let apiCalls = 0;

function optimizeAssets(dir, assets = [], sizes = [], custom = []) {
    return new Promise(resolve => {
        if (!hasFreeApiCalls(assets.length * sizes.length * 2)) {
            process.exit();
        }
        Promise.all(
            assets.map(
                asset => Promise.all([
                    ...sizes.map(width => {
                        const targetDir = path.join(dir, `${width}px`);
                        const source = path.join(dir, asset);
                        const options = {
                            method: 'scale',
                            width
                        };
                        return optimizeSingleAsset(targetDir, source, asset, options);
                    }),
                    ...custom.map(entry => {
                        const targetDir = path.join(dir, entry.dir);
                        const source = path.join(dir, asset);
                        const name = entry.name || asset;
                        const { method, width, height } = entry;
                        const options = {
                            method,
                            width
                        };
                        if (height) {
                            options.height = height;
                        }
                        return optimizeSingleAsset(targetDir, source, name, options);
                    })
                ])
            )
        )
            .then(() => {
                addCallCount(apiCalls);
                apiCalls = 0;
                resolve();
            })
            .catch(console.error);
    });
}

function optimizeSingleAsset(targetDir, source, name, options) {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    const target = path.join(targetDir, name);
    if (fs.existsSync(target)) {
        return Promise.resolve()
            .then(() => console.log(`Asset already exists: ${targetDir}/${name}`))
    }
    return tinifyApi(source, target, options)
        .then(() => {
            apiCalls += 2;
            console.log(`Saved optimized asset ${targetDir}/${name}`);
        });
}

module.exports = optimizeAssets;