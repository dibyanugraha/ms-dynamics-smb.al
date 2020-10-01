"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const resources_1 = require("./resources");
/** Opens the specified text document and wraps the result into a promise */
function openTextDocument(path) {
    return new Promise((resolve, reject) => {
        vscode.workspace.openTextDocument(path)
            .then(doc => vscode.window.showTextDocument(doc), reject)
            .then(e => resolve(e), reject);
    });
}
exports.openTextDocument = openTextDocument;
function showInputBox(options, required) {
    if (required) {
        options.validateInput = value => value ? "" : resources_1.default.requiredField;
    }
    return new Promise((resolve, reject) => {
        vscode.window.showInputBox(options).then(result => {
            if (!result) {
                return reject();
            }
            resolve(result);
        });
    });
}
exports.showInputBox = showInputBox;
//# sourceMappingURL=vscodeHelpers.js.map