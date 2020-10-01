"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const vscode = require("vscode");
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const osHelpers_1 = require("../osHelpers");
const resources_1 = require("../resources");
/**
 * The base service class for extension services.
 */
class ExtensionService {
    constructor(context) {
        this.context = context;
    }
    activate() { }
    /**
     * Registers a command which can only run if a folder is opened in VSCode.
     */
    registerFolderCommand(commandName, callback) {
        const disposable = this.context.registerCommand(commandName, (...args) => {
            if (!vscode.workspace.workspaceFolders) {
                return this.showNoRootPathWarning();
            }
            return callback(...args);
        });
        this.registerForDisposal(disposable);
    }
    showNoRootPathWarning() {
        return vscode.window.showWarningMessage(util.format(resources_1.default.noRootPathMessage, constants_1.AlExtensionName), resources_1.default.openFolderAction)
            .then(choice => {
            if (choice === resources_1.default.openFolderAction) {
                vscode.commands.executeCommand("vscode.openFolder");
            }
        });
    }
    getServerPath() {
        const alConfig = vscode.workspace.getConfiguration(constants_2.AlLanguageId);
        let serverPath = alConfig.get("editorServicesPath");
        if (!path.isAbsolute(serverPath)) {
            serverPath = this.context.asAbsolutePath(serverPath);
        }
        if (osHelpers_1.isMacOS()) {
            serverPath = path.join(serverPath, os.platform());
        }
        else if (osHelpers_1.isWindows()) {
            if (!alConfig.get("useLegacyRuntime")) {
                let netCorePath = path.join(serverPath, os.platform());
                // If you are developing and you forgot to specify the -WindowsCore switch
                // then the win32 .NET core binaries will not exist and the language service
                // will fail to launch
                if (fs.existsSync(netCorePath)) {
                    serverPath = netCorePath;
                }
                else {
                    console.log("Failed to find .NET Core binaries. Falling back to legacy runtime.");
                }
            }
        }
        else if (fs.existsSync(path.join(serverPath, os.platform()))) {
            serverPath = path.join(serverPath, os.platform());
        }
        serverPath = path.join(serverPath, "Microsoft.Dynamics.Nav.EditorServices.Host");
        if (osHelpers_1.isWindows()) {
            serverPath += ".exe";
        }
        else {
            fs.chmodSync(serverPath, 0o755);
        }
        return serverPath;
    }
    registerForDisposal(disposable) {
        this.context.subscriptions.push(disposable);
    }
}
exports.ExtensionService = ExtensionService;
//# sourceMappingURL=extensionService.js.map