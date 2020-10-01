"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("./constants");
function initializeOuputChannel(preferredChannel) {
    exports.outputChannel = preferredChannel || vscode.window.createOutputChannel(constants_1.AlLanguageClientName);
}
exports.initializeOuputChannel = initializeOuputChannel;
//# sourceMappingURL=status.js.map