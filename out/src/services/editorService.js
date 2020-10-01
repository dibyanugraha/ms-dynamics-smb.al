"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const status_1 = require("../status");
const workspaceFolderHelpers_1 = require("../workspaceFolderHelpers");
const alworkspace = require("./alWorkspace");
const extensionService_1 = require("./extensionService");
const languageClientImpl_1 = require("./languageClientImpl");
const rc = require("./settings");
const configurationHelpers_1 = require("../configurationHelpers");
/**
 * When configuration documents are saved, vscode fires onDidChangeConfiguration which serves as an indicator
 * that the caller can continue executing.
 * However, a safety measure is also put to ensure that calling saveAllDocuments always resolves a promise.
 * If no event is raised within certain time, saveAllDocuments still resolves a promise.
 */
const SafetyConfigurationUpdateTimeout = 2000;
/**
 * The service responsible for starting the language service, packaging and publishing commands.
 */
class EditorService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.lastActiveWorkspacePath = null;
        this.languageServerClient = null;
        /**
         * A deferred promise resolution callback for saving all documents in case a configuration is dirty and needs to be updated.
         */
        this.deferredResolveSaveAll = null;
        this.safetyConfigurationTimer = null;
        this.onConfigurationChanged = () => {
            if (this.safetyConfigurationTimer) {
                clearTimeout(this.safetyConfigurationTimer);
                this.safetyConfigurationTimer = null;
            }
            if (this.deferredResolveSaveAll) {
                this.deferredResolveSaveAll();
                this.deferredResolveSaveAll = null;
            }
        };
        this.onSetActiveWorkspace = () => {
            this.setActiveWorkspace();
        };
        this.registerForDisposal(vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged));
        this.registerForDisposal(vscode.window.onDidChangeActiveTextEditor(this.onSetActiveWorkspace));
        this.registerForDisposal(vscode.workspace.onDidChangeWorkspaceFolders(event => this.onWorkspaceFoldersChanged(event.added, event.removed)));
    }
    tryStartLanguageServer() {
        if (!vscode.workspace.workspaceFolders) {
            return null;
        }
        const args = [];
        for (const arg of configurationHelpers_1.getLanguageServerOptions()) {
            args.push(arg);
        }
        const serverPath = this.getServerPath();
        const serverOptions = {
            run: {
                command: serverPath,
                args: args
            },
            debug: {
                command: serverPath,
                args: args
            }
        };
        const clientOptions = {
            documentSelector: [constants_1.AlLanguageId, "json"],
            synchronize: {
                configurationSection: constants_1.AlLanguageId,
                fileEvents: vscode.workspace.createFileSystemWatcher("**/*")
            },
            middleware: {
                workspace: {
                    didChangeConfiguration: () => languageServerClient.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: rc.getWorkspaceSettings() }),
                }
            }
        };
        const languageServerClient = new vscode_languageclient_1.LanguageClient(constants_1.AlLanguageClientName, serverOptions, clientOptions);
        languageServerClient.onReady().then(() => {
            this.setActiveWorkspace();
        }, reason => vscode.window.showErrorMessage(util.format(resources_1.default.languageClientStartupError, reason)));
        const disposable = languageServerClient.start();
        this.registerForDisposal(disposable);
        this.languageServerClient = languageServerClient;
        return new languageClientImpl_1.LanguageClientImpl(this.languageServerClient);
    }
    /**
     * Saves all dirty documents and in case a launch.json is dirty, waits for vscode configuration service to be updated.
     * If the configuration file is dirty, it takes some time after saving until vscode api return the new data from the file.
     * Therefore in this case, a promise resolution callback is stored locally and invoked later when vscode signals that configuration has been changed.
     */
    saveAllDocuments() {
        return new Promise((resolve, reject) => {
            const configurationDirty = this.initalizeDebugAdapterService.isDirty();
            vscode.workspace.saveAll(true).then(saved => {
                if (!saved) {
                    status_1.outputChannel.appendLine(resources_1.default.notAllFilesSavedError);
                    return reject();
                }
                if (configurationDirty) {
                    this.deferredResolveSaveAll = resolve;
                    this.safetyConfigurationTimer = setTimeout(this.onConfigurationChanged, SafetyConfigurationUpdateTimeout);
                }
                else {
                    resolve();
                }
            }, reject);
        });
    }
    get projectDependencyService() {
        return this._projectDependencyService;
    }
    set projectDependencyService(s) {
        this._projectDependencyService = s;
    }
    setActiveWorkspace() {
        if (!this.languageServerClient) {
            return;
        }
        const w = workspaceFolderHelpers_1.getCurrentWorkspaceFolder();
        if (!w) {
            return;
        }
        const currentWorkspaceFolderPath = w.uri.fsPath;
        if (this.lastActiveWorkspacePath === currentWorkspaceFolderPath) {
            return;
        }
        const params = { currentWorkspaceFolderPath: w, settings: rc.getWorkspaceSettings() };
        this.languageServerClient.sendRequest(constants_1.AlSetActiveWorkspace, params)
            .then((response) => {
            if (response.success) {
                vscode.window.setStatusBarMessage(w.name);
                this.lastActiveWorkspacePath = currentWorkspaceFolderPath;
            }
            else {
                vscode.window.setStatusBarMessage(resources_2.default.noActiveWorkspaceFolder);
                this.lastActiveWorkspacePath = undefined;
            }
        });
    }
    onWorkspaceFoldersChanged(added, removed) {
        const params = {
            added: added.map(w => alworkspace.map(w)),
            removed: removed.map(w => alworkspace.map(w))
        };
        // Remove projects from the dependency map.
        // We should not care of added projects now. They are handled by the AlDidChangeWorkspaceFolders and its server callback.
        if (this.projectDependencyService) {
            const dependentProjects = this.projectDependencyService.getDependentLoadedProjects();
            removed.forEach(r => {
                dependentProjects.delete(r.uri.fsPath.toLowerCase());
            });
        }
        // Remove diagnostics associated with the removed projects
        this.removeProjectDiagnostics(removed);
        this.languageServerClient.sendRequest(constants_1.AlDidChangeWorkspaceFolders, params).then((response) => {
            this.setActiveWorkspace();
        });
    }
    removeProjectDiagnostics(projects) {
        const diagnostics = this.languageServerClient.diagnostics;
        if (diagnostics) {
            let toRemove = new Set();
            projects.forEach(proj => {
                let projPath = proj.uri.fsPath;
                diagnostics.forEach((uri, diagnostics, collection) => {
                    let uriPath = uri.fsPath;
                    if (uriPath.startsWith(projPath)) {
                        if (projPath.length === uriPath.length) {
                            toRemove.add(uri);
                        }
                        else {
                            let char = uri.fsPath.charAt(proj.uri.fsPath.length);
                            if (char === "\\" || char === "/") {
                                toRemove.add(uri);
                            }
                        }
                    }
                });
            });
            toRemove.forEach(r => { diagnostics.delete(r); });
        }
    }
}
exports.EditorService = EditorService;
//# sourceMappingURL=editorService.js.map