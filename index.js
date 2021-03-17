const path = require('path');
const fs = require('fs');
const optimizeAssets = require('./lib/optimizeAssets');

const projectPath = process.argv[2];

if (!projectPath) {
    console.warn(`\nCouldn't optimize assets. Please pass a project path as first arg.\n`);
    process.exit();
}

const projectDir = path.resolve(projectPath);

if (!fs.existsSync(projectDir)) {
    console.warn(`\nCouldn't find ${projectDir}.\n`);
    process.exit();
}

const CONFIG = require('./config.json');

iterateOverAssets(CONFIG)
    .then(() => console.log('Done.\n'));

async function iterateOverAssets(config) {
    const c = { ...config };
    const [ assetType ] = Object.keys(c);
    if (!assetType) {
        return;
    }
    const entry = c[assetType];
    delete c[assetType];
    const dir = path.join(projectDir, ...entry.path);
    if (fs.existsSync(dir)) {
        const assets = fs.readdirSync(dir).filter(e => entry.sources.find(src => e.endsWith(src)));
        await optimizeAssets(dir, assets, entry.sizes, entry.custom);
        console.log(`Optimized ${assetType} in ${projectDir}.\n`);
    }
    await iterateOverAssets(c);
}
