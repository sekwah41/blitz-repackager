const fs = require('fs');
const path = require('path');
const Seven = require('node-7z');
const asar = require('asar');
const rimraf = require('rimraf');
const download = require('progress-download');
const blitzExeName = "win";
const blitzExeUrl = `https://blitz.gg/download/win`;
const buildResFolder = path.join(__dirname, "../build-resources");
const blitzExe = path.join(buildResFolder, blitzExeName);
const blitzUnpacked = path.join(buildResFolder, "exe-contents");
const appZip = path.join(blitzUnpacked, "$PLUGINSDIR", "app-64.7z");
const unpackContents = path.join(buildResFolder, "unpacked");
const binaries = path.join(buildResFolder, "resources", "binaries");
const extractedAsar = path.join(buildResFolder, "extracted-asar");
const asarFile = path.join(unpackContents, "resources", "app.asar");
const prebuilt_win = path.join(__dirname, "../app", "prebuilt_win");
const ProgressBar = require('progress');

function extractAsync(name, stream) {
    console.log(`Extracting ${name}`)
    const bar = new ProgressBar('   extracting [:bar] :percent', {total: 25});
    return new Promise((res,rej) => {
        stream.on('data', function (data) {
            //console.log(data) //? { status: 'extracted', file: 'extracted/file.txt" }
        })
        stream.on('progress', function (progress) {
            // console.log(progress);
            bar.update(progress.percent / 100);
        })
        stream.on('end', () => {
            bar.update(1);
            res();
        })
            .on('error', rej);
    });
}

function removeIfExists(path) {
    if(fs.existsSync(path)) {
        rimraf.sync(path)
    }
}

(async () => {
    if(!fs.existsSync(buildResFolder)) fs.mkdirSync(buildResFolder);

    if(!fs.existsSync(blitzExe)) {
        console.log("Downloading Blitz");
        await download(blitzExeUrl, buildResFolder);
    } else {
        console.log("Found Blitz, skipping download.");
    }

    removeIfExists(blitzUnpacked);
    await extractAsync("exe", Seven.extractFull(blitzExe, blitzUnpacked, {
        $progress: true
    }));
    await extractAsync("app-64", Seven.extractFull(appZip, unpackContents, {
        $progress: true
    }));

    console.log("Extracting asar");
    removeIfExists(extractedAsar);
    asar.extractAll(asarFile, extractedAsar);

    removeIfExists(rebuildFolder);
    console.log("Moving files for re-building");
    fs.renameSync(extractedAsar, rebuildFolder);

    const node_modules = path.join(rebuildFolder, "node_modules");

    

    const valorant_utils = path.join(node_modules, "valorant-utils");

    const moba_dist = path.join(__dirname, "../extracted_packages/valorant-utils");

    
    
    if(!fs.existsSync(moba_dist)) {
        console.log("Saving needed module (valorant-utils)");
        fs.cpSync(valorant_utils, moba_dist, {recursive: true})
    } else {
        console.log("Found valorant-utils, skipping step.");
    }

    if(!fs.existsSync(prebuilt_win)) {
        console.log("Copying pre-built modules (prebuilt_win)");
        fs.cpSync(binaries, prebuilt_win, {recursive: true})
    }

    console.log("Deleting node_modules (these ones are meant for windows)");
    removeIfExists(node_modules);

})();