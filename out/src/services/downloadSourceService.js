"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const vscode = require("vscode");
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const fsHelpers_1 = require("../fsHelpers");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const status_1 = require("../status");
const workspaceHelpers = require("../workspaceFolderHelpers");
const extensionService_1 = require("./extensionService");
const serverProxy_1 = require("./serverProxy");
class DownloadSourceService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService, languageServerClient) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.languageServerClient = languageServerClient;
        this.serverProxy = new serverProxy_1.ServerProxy(languageServerClient);
    }
    activate() {
        this.registerFolderCommand("al.downloadSource", () => this.downloadSource());
    }
    downloadSource() {
        return this.initalizeDebugAdapterService.getDebugAdapterConfiguration()
            .then(c => {
            status_1.outputChannel.clear();
            status_1.outputChannel.show();
            return this.sendDownloadSourceRequest(c);
        })
            .then(responseContent => this.onDownloadComplete(responseContent))
            .catch(reason => this.onDownloadComplete({ success: false, changes: null, newFiles: [] }));
    }
    sendDownloadSourceRequest(config) {
        const params = configurationHelpers_1.getAlParams();
        return this.serverProxy.sendRequest(config, constants_1.AlDownloadSourceRequest, params);
    }
    onDownloadComplete(content) {
        if (content.success) {
            const workspaceEdit = this.asWorkspaceEdit(content.changes);
            return vscode.workspace.applyEdit(workspaceEdit)
                .then(() => this.createNewFiles(content.newFiles), () => {
                this.showErrorMessage(resources_1.default.downloadSourceApplyChanges);
            });
        }
        else {
            this.showErrorMessage(resources_1.default.downloadSourceFailure);
        }
    }
    createNewFiles(newfiles) {
        const w = workspaceHelpers.getCurrentWorkspaceFolderPath();
        if (!w) {
            return Promise.reject(resources_2.default.noActiveWorkspaceFolder);
        }
        return Promise.all(newfiles.map(file => {
            const filepath = path.join(w, file.fileName);
            return fsHelpers_1.writeTextFileAsync(filepath, file.content)
                .catch(reason => {
                status_1.outputChannel.appendLine(util.format(resources_1.default.failedCreatingFile, filepath, reason));
                throw reason;
            });
        }))
            .then(() => {
            vscode.window.showInformationMessage(resources_1.default.downloadSourceSuccess);
        })
            .catch(reason => {
            this.showErrorMessage(resources_1.default.downloadSourceNewFilesFailure);
        });
    }
    showErrorMessage(message) {
        vscode.window.showErrorMessage(message, resources_1.default.tryAgainAction)
            .then(choice => {
            if (choice === resources_1.default.tryAgainAction) {
                this.downloadSource();
            }
        });
    }
    asWorkspaceEdit(item) {
        if (!item) {
            return null;
        }
        const result = new vscode.WorkspaceEdit();
        if (item.changes) {
            Object.keys(item.changes).forEach(filepath => {
                result.set(vscode.Uri.parse(filepath), this.asTextEdits(item.changes[filepath]));
            });
        }
        return result;
    }
    asTextEdits(items) {
        if (!items) {
            return null;
        }
        return items.map(x => this.asTextEdit(x));
    }
    asTextEdit(edit) {
        return new vscode.TextEdit(this.asRange(edit.range), edit.newText);
    }
    asRange(value) {
        if (!value) {
            return null;
        }
        return new vscode.Range(this.asPosition(value.start), this.asPosition(value.end));
    }
    asPosition(value) {
        if (!value) {
            return null;
        }
        return new vscode.Position(value.line, value.character);
    }
}
exports.DownloadSourceService = DownloadSourceService;
//# sourceMappingURL=downloadSourceService.js.map