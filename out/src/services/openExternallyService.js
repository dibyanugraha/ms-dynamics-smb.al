"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const os_1 = require("os");
const vscode = require("vscode");
const extensionService_1 = require("./extensionService");
/**
 * The service responsible for registering context menu action for opening files in external applications.
 */
class OpenExternallyService extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
    }
    activate() {
        const disposable = vscode.commands.registerCommand("al.openExternally", (...args) => {
            const filePath = args[0]["fsPath"];
            let command = filePath + '"';
            switch (os_1.platform()) {
                case "win32":
                    command = 'start "" "' + command;
                    break;
                case "darwin":
                    command = 'open "' + command;
                    break;
                default:
                    command = "xdg-open " + command;
                    break;
            }
            child_process_1.exec(command);
        });
        this.registerForDisposal(disposable);
    }
}
exports.OpenExternallyService = OpenExternallyService;
//# sourceMappingURL=openExternallyService.js.map