"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const status_1 = require("../status");
const workspaceHelpers = require("../workspaceFolderHelpers");
const extensionService_1 = require("./extensionService");
const initalizeDebugAdapterService_1 = require("./initalizeDebugAdapterService");
const serverProxy_1 = require("./serverProxy");
class BuildService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient, symbolsService, initalizeDebugAdapterService, editorService, projectDependencyHandlerService) {
        super(context);
        this.languageServerClient = languageServerClient;
        this.symbolsService = symbolsService;
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.editorService = editorService;
        this.projectDependencyHandlerService = projectDependencyHandlerService;
        this.serverProxy = new serverProxy_1.ServerProxy(this.languageServerClient);
    }
    activate() {
        this.registerFolderCommand("al.package", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.packageContainer()
                .then((result) => {
                if (!result) {
                    // In case that the packaging returns false the default action to open the run task dialogue is executed
                    this.context.executeCommand('workbench.action.tasks.build');
                }
            })
                .catch(() => {
            });
        }));
        this.registerFolderCommand("al.publish", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.publishContainer()
                .then((result) => {
                if (!result) {
                    // In case that the method returns false do the default action to F5.
                    this.context.executeCommand('workbench.action.debug.start');
                }
            })
                .catch(() => {
            });
        }));
        this.registerFolderCommand("al.publishNoDebug", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.publishContainer(true)
                .then((result) => {
                if (!result) {
                    // In case that the method returns false do the default action to Ctrl F5.
                    this.context.executeCommand('workbench.action.debug.run');
                }
            })
                .catch(() => {
                // ignore
            });
        }));
        this.registerFolderCommand("al.incrementalPublish", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.publishContainer(false, true)
                .catch(() => {
                // ignore
            });
        }));
        this.registerFolderCommand("al.incrementalPublishNoDebug", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.publishContainer(true, true)
                .catch(() => {
                // ignore
            });
        }));
        this.registerFolderCommand("al.onlyDebug", () => this.startDebugging(false, false, true)
            .catch(() => {
            // ignore
        }));
        this.registerFolderCommand("al.clearCredentialsCache", () => this.clearCredentialsCache()
            .catch(() => {
            // ignore
        }));
        this.context.workspaceState.update(constants_1.SymbolsCheckedStateKey, false);
    }
    packageContainer(isRad) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workspaceHelpers.isActiveWorkspacePossibleAlWorkspace()) {
                return Promise.resolve(false);
            }
            status_1.outputChannel.show();
            status_1.outputChannel.clear();
            yield this.editorService.saveAllDocuments()
                .then(() => this.downloadSymbolsOnce())
                .then(() => this.performBuild(isRad));
            return Promise.resolve(true);
        });
    }
    publishContainer(publishOnly, isRad) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWorkspaceFolder = workspaceHelpers.getCurrentWorkspaceFolder();
            if (!currentWorkspaceFolder) {
                return Promise.resolve(false);
            }
            status_1.outputChannel.show();
            status_1.outputChannel.clear();
            yield this.packageContainer(isRad)
                .then(() => this.startDebugging(publishOnly, isRad, false))
                .then(() => {
                // Reload the the Rad file with the state publishing has left it.
                this.reloadRadFile();
            })
                .catch(() => {
                // ignored
            });
            return Promise.resolve(true);
        });
    }
    startDebugging(publishOnly, isRad, justDebug) {
        status_1.outputChannel.show();
        status_1.outputChannel.clear();
        const currentWorkspaceFolder = workspaceHelpers.getCurrentWorkspaceFolder();
        if (!currentWorkspaceFolder) {
            return Promise.reject(resources_2.default.noActiveWorkspaceFolder);
        }
        let filter = initalizeDebugAdapterService_1.DebugConfigurationFilter.Launch | initalizeDebugAdapterService_1.DebugConfigurationFilter.Attach;
        ;
        if (publishOnly) {
            filter = initalizeDebugAdapterService_1.DebugConfigurationFilter.Launch;
        }
        return this.launchDebugger(currentWorkspaceFolder, publishOnly, isRad, justDebug, filter);
    }
    launchDebugger(currentWorkspaceFolder, publishOnly, isRad, justDebug, filter) {
        return this.initalizeDebugAdapterService.mapToDebugConfiguration(publishOnly, isRad, justDebug, filter)
            .then(config => this.ensureAuthenticated(config)
            .then(config => {
            // VSCode not always switches to the debug console, where all the useful message are.
            // Therefore, debug console is activated.
            // If this is the first time debugging is started, do not show the console since debugger selection list has focus.
            //
            // Furthermore, clearing the previous debug console session since otherwise previous session is overlaying current one.
            if (this.initalizeDebugAdapterService.isConfigured()) {
                this.context.executeCommand("workbench.debug.panel.action.clearReplAction");
                this.context.executeCommand("workbench.debug.action.focusRepl");
            }
            return config;
        })
            .then(config => this.context.startDebugging(currentWorkspaceFolder, config))
            .then(() => { }));
    }
    downloadSymbolsOnce() {
        let symbolsPromise = null;
        if (!this.context.workspaceState.get(constants_1.SymbolsCheckedStateKey)) {
            symbolsPromise = this.symbolsService.checkSymbols()
                .then(result => {
                if (!result) {
                    return this.symbolsService.downloadSymbols(true);
                }
                return null;
            })
                .catch(() => {
                // ignore symbol errors to get compilation errors in the console as well
            });
        }
        else {
            symbolsPromise = Promise.resolve();
        }
        return symbolsPromise;
    }
    performBuild(isRad) {
        return new Promise((resolve, reject) => {
            const workspaceRoot = workspaceHelpers.getCurrentWorkspaceFolderPath();
            if (workspaceRoot) {
                const args = ['-project:"' + workspaceRoot + '"'];
                for (const arg of configurationHelpers_1.getCompilerOptions()) {
                    args.push(arg);
                }
                this.languageServerClient.sendRequest(constants_1.AlCreatePackageRequest, { projectDir: workspaceRoot, args, isRad: isRad })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    status_1.outputChannel.appendLine(response.success ? resources_1.default.packageCreatedMessage : resources_1.default.packageNotCreatedError);
                    if (response.success) {
                        yield this.copyOutputFileToAllWorkspacesDependingOnCurrentWorkspace(response.outputPath).then(() => {
                            this.context.workspaceState.update(constants_1.SymbolsCheckedStateKey, true);
                            resolve();
                        }, (rejected) => reject(rejected));
                    }
                    else {
                        reject();
                    }
                }), reject);
            }
            else {
                reject(resources_2.default.noActiveWorkspaceFolder);
            }
        });
    }
    reloadRadFile() {
        return new Promise((resolve, reject) => {
            return this.languageServerClient.sendRequest(constants_1.AlReloadRadFileRequest, {});
        });
    }
    /**
     * Ensures that the user is authenticated in case if publishing is the first action which requires server communication.
     */
    ensureAuthenticated(configuration) {
        return configurationHelpers_1.ensureAuthenticated(configuration, this.serverProxy);
    }
    clearCredentialsCache() {
        this.languageServerClient.sendRequest(constants_1.AlClearCredentialsCacheRequest, {});
        return Promise.resolve();
    }
    copyOutputFileToAllWorkspacesDependingOnCurrentWorkspace(outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.projectDependencyHandlerService.copyOutputFileToAllWorkspacesDependingOnCurrentWorkspace(outputPath);
        });
    }
}
exports.BuildService = BuildService;
//# sourceMappingURL=buildService.js.map