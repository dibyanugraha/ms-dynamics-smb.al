"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const os = require("os");
const path = require("path");
const util = require("util");
const resources_1 = require("./resources");
const status_1 = require("./status");
function spawn(exePath, args) {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn(exePath, args, { env: process.env });
        proc.stdout.on("data", pipe);
        proc.stderr.on("data", pipe);
        proc.on("close", code => {
            if (code) {
                reject(new Error(util.format(resources_1.default.processExitCodeError, code)));
            }
            else {
                resolve(code);
            }
        });
    });
}
exports.spawn = spawn;
function getMyProjectsDir() {
    // TODO: test on mac as well
    return path.join(os.homedir(), "Documents", "AL");
}
exports.getMyProjectsDir = getMyProjectsDir;
function pipe(chunk) {
    status_1.outputChannel.append(chunk.toString());
}
function isWindows() {
    return os.platform() === "win32";
}
exports.isWindows = isWindows;
function isMacOS() {
    return os.platform() === "darwin";
}
exports.isMacOS = isMacOS;
//# sourceMappingURL=osHelpers.js.map