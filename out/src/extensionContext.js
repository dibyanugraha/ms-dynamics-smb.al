"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ExtensionContextImpl {
    constructor(context) {
        this.context = context;
    }
    get subscriptions() {
        return this.context.subscriptions;
    }
    get workspaceState() {
        return this.context.workspaceState;
    }
    get globalState() {
        return this.context.globalState;
    }
    get extensionPath() {
        return this.context.extensionPath;
    }
    asAbsolutePath(relativePath) {
        return this.context.asAbsolutePath(relativePath);
    }
    registerCommand(command, callback, thisArg) {
        return vscode.commands.registerCommand(command, callback, thisArg);
    }
    executeCommand(command, ...args) {
        return vscode.commands.executeCommand(command, args);
    }
    startDebugging(currentWorkspaceFolder, config) {
        return vscode.debug.startDebugging(currentWorkspaceFolder, config);
    }
}
exports.ExtensionContextImpl = ExtensionContextImpl;
//# sourceMappingURL=extensionContext.js.map