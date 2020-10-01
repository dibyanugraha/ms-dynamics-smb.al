"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const osHelpers_1 = require("./osHelpers");
function copyTextToClipboard(text) {
    if (osHelpers_1.isMacOS()) {
        child_process_1.execSync("echo " + text + "| pbcopy");
    }
    if (osHelpers_1.isWindows()) {
        child_process_1.spawnSync("cmd.exe", ["/c", "echo " + text + "| clip"]);
    }
}
exports.copyTextToClipboard = copyTextToClipboard;
//# sourceMappingURL=clipboard.js.map