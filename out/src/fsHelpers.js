"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
/**
 * Creates a folder and all its parents, if possible. The result is provided via a callback.
 */
function mkdirp(dir, callback) {
    dir = path.resolve(dir);
    fs.mkdir(dir, mkdirError => {
        if (mkdirError.code === "ENOENT") {
            mkdirp(path.dirname(dir), mkdirPError => {
                if (mkdirPError) {
                    return callback(mkdirPError);
                }
                mkdirp(dir, callback);
            });
        }
        else {
            callback(mkdirError);
        }
    });
}
exports.mkdirp = mkdirp;
/**
 * Creates a folder and all its parents, if possible. Synchronous version.
 */
function mkdirpSync(dir) {
    dir = path.resolve(dir);
    try {
        fs.mkdirSync(dir);
    }
    catch (e) {
        if (e.code === "ENOENT") {
            mkdirpSync(path.dirname(dir));
            mkdirpSync(dir);
        }
        else {
            throw e;
        }
    }
}
exports.mkdirpSync = mkdirpSync;
/**
 * Creates a folder. The result is provided via a promise.
 */
function mkdirAsync(dir) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, e => {
            if (e) {
                return reject(e);
            }
            return resolve(true);
        });
    });
}
exports.mkdirAsync = mkdirAsync;
/**
 * Creates a folder and all its parents, if possible. The result is provided via a promise.
 */
function mkdirpAsync(dir) {
    return new Promise((resolve, reject) => {
        mkdirp(dir, e => {
            if (e) {
                return reject(e);
            }
            return resolve(true);
        });
    });
}
exports.mkdirpAsync = mkdirpAsync;
function findNextNonExistingDir(initialPath, counter = 1, callback) {
    const currentPath = initialPath + counter;
    fs.stat(currentPath, (e, stat) => {
        if (e) {
            if (e.code === "ENOENT") {
                return callback(null, currentPath);
            }
            return callback(e, null);
        }
        if (stat.isDirectory() || stat.isFile()) {
            return findNextNonExistingDir(initialPath, counter + 1, callback);
        }
        return callback(new Error("Unexpected path type"), null);
    });
}
exports.findNextNonExistingDir = findNextNonExistingDir;
function findNextNonExistingDirAsync(initialPath) {
    return new Promise((resolve, reject) => {
        findNextNonExistingDir(initialPath, 1, (e, dir) => {
            if (e) {
                return reject(e);
            }
            return resolve(dir);
        });
    });
}
exports.findNextNonExistingDirAsync = findNextNonExistingDirAsync;
function writeTextFileAsync(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, { encoding: "utf-8" }, e => {
            if (e) {
                return reject(e);
            }
            resolve(true);
        });
    });
}
exports.writeTextFileAsync = writeTextFileAsync;
function existsFileAsync(filename) {
    return new Promise(resolve => {
        fs.exists(filename, exists => {
            resolve(exists);
        });
    });
}
exports.existsFileAsync = existsFileAsync;
//# sourceMappingURL=fsHelpers.js.map