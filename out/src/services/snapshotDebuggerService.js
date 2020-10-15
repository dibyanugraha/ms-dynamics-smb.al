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
const vscode = require("vscode");
const util = require("util");
const workspaceHelpers = require("../workspaceFolderHelpers");
const path = require("path");
const fs = require("fs");
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const initalizeDebugAdapterService_1 = require("./initalizeDebugAdapterService");
const resources_1 = require("../resources");
const fs_1 = require("fs");
const snapshotDebugger_1 = require("./snapshotDebugger");
const workspaceFolderHelpers_1 = require("../workspaceFolderHelpers");
var SnapshotStatus;
(function (SnapshotStatus) {
    SnapshotStatus[SnapshotStatus["Failed"] = 0] = "Failed";
    SnapshotStatus[SnapshotStatus["Initialized"] = 1] = "Initialized";
    SnapshotStatus[SnapshotStatus["Started"] = 2] = "Started";
    SnapshotStatus[SnapshotStatus["Finished"] = 3] = "Finished";
    SnapshotStatus[SnapshotStatus["Downloaded"] = 4] = "Downloaded";
})(SnapshotStatus = exports.SnapshotStatus || (exports.SnapshotStatus = {}));
var SnapshotStatusFilter;
(function (SnapshotStatusFilter) {
    SnapshotStatusFilter[SnapshotStatusFilter["Failed"] = 1] = "Failed";
    SnapshotStatusFilter[SnapshotStatusFilter["Initialized"] = 2] = "Initialized";
    SnapshotStatusFilter[SnapshotStatusFilter["Started"] = 4] = "Started";
    SnapshotStatusFilter[SnapshotStatusFilter["Finished"] = 8] = "Finished";
    SnapshotStatusFilter[SnapshotStatusFilter["Downloaded"] = 16] = "Downloaded";
    SnapshotStatusFilter[SnapshotStatusFilter["All"] = 31] = "All";
})(SnapshotStatusFilter = exports.SnapshotStatusFilter || (exports.SnapshotStatusFilter = {}));
var AttachKind;
(function (AttachKind) {
    AttachKind[AttachKind["Undefined"] = 0] = "Undefined";
    AttachKind[AttachKind["UserSession"] = 1] = "UserSession";
    AttachKind[AttachKind["NextSessionForUserOnTenant"] = 2] = "NextSessionForUserOnTenant";
    AttachKind[AttachKind["NextSessionOnTenant"] = 3] = "NextSessionOnTenant";
})(AttachKind = exports.AttachKind || (exports.AttachKind = {}));
class SnapshotDebuggerService extends extensionService_1.ExtensionService {
    constructor(context, serverProxy, initalizeDebugAdapterService) {
        super(context);
        this.serverProxy = serverProxy;
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.requests = new Map();
        this.delegate = this.selectSnapshot;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    }
    activate() {
        this.registerFolderCommand("al.initalizeSnapshotDebugging", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.initalizeSnapshotDebugging()
                .catch(() => {
                // ignore
            });
        }));
        this.registerFolderCommand("al.finishSnapshotDebugging", () => __awaiter(this, void 0, void 0, function* () {
            return yield this.finishSnapshotDebugging()
                .catch(() => {
                // ignore
            });
        }));
        this.registerFolderCommand("al.snapshots", () => this.showSnapshots()
            .catch(() => {
            // ignore
        }));
        this.createSnapshotFileSystemWatcher();
        this.deserializeSnapshotData();
        this.updateWithExistingSnapshots();
        this.updateDisplay();
    }
    get SnapshotStatusFilterDelegate() {
        return this.delegate;
    }
    set SnapshotStatusFilterDelegate(value) {
        this.delegate = value;
    }
    getRequests() {
        return this.requests;
    }
    getSnapshotOutputDirectory(workspacePath) {
        const uri = vscode.Uri.file(workspacePath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        return this.getSnapshotOutputDirectoryFromFolder(workspaceFolder);
    }
    getSnapshotStatus(debuggingContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = this.requests.get(debuggingContext);
            if (context.status === SnapshotStatus.Downloaded) {
                return Promise.resolve();
            }
            let config = yield this.ensureAuthenticated(context.debugConfig);
            let params = Object.assign(context.debugConfig, configurationHelpers_1.getAlParams());
            params = Object.assign(params, {
                debuggingContext: debuggingContext,
                affinityCookie: context.affinityCookie
            });
            const result = yield this.serverProxy.sendServerConnectionRequest(config, params, constants_1.AlSnapshotStatusRequest);
            if (result) {
                context.status = this.mapStatus(result.status, debuggingContext);
            }
            else {
                context.status = SnapshotStatus.Failed;
            }
        });
    }
    handleAlFileDeleted(event) {
        for (const uri of event.files) {
            const workspaceFolder = this.isFileInSnapshotOutputDirectoryOfAnyWorkspace(uri);
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder.uri.fsPath.toLowerCase();
                const snapshotFileName = path.basename(uri.fsPath, path.extname(uri.fsPath));
                const context = this.requests.get(snapshotFileName);
                if (context && workspaceFolderPath === context.workspacePath.toLowerCase()) {
                    this.removeDebuggingContextFromSerializedSnapshotData(snapshotFileName);
                    this.requests.delete(snapshotFileName);
                }
            }
        }
        this.updateDisplay();
    }
    handleAlFileRenamed(event) {
        for (const renamedEvent of event.files) {
            const workspaceFolder = this.isFileInSnapshotOutputDirectoryOfAnyWorkspace(renamedEvent.oldUri);
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder.uri.fsPath.toLowerCase();
                const oldDebuggingContext = path.basename(renamedEvent.oldUri.fsPath, path.extname(renamedEvent.oldUri.fsPath));
                const context = this.requests.get(oldDebuggingContext);
                if (context && workspaceFolderPath === context.workspacePath.toLowerCase()) {
                    this.requests.delete(oldDebuggingContext);
                    const newDebuggingContext = path.basename(renamedEvent.newUri.fsPath, path.extname(renamedEvent.newUri.fsPath));
                    this.requests.set(newDebuggingContext, context);
                    this.updatedebuggingContextInSerializedSnapshotData(oldDebuggingContext, newDebuggingContext);
                }
            }
        }
        this.updateDisplay();
    }
    isFileInSnapshotOutputDirectoryOfAnyWorkspace(uri) {
        const ext = path.extname(uri.fsPath);
        if (ext.toLowerCase() !== constants_1.SnapshotFileNameExtension) {
            return undefined;
        }
        const declaringDirectory = path.dirname(uri.fsPath).toLowerCase();
        for (const w of vscode.workspace.workspaceFolders) {
            const outputDir = this.getSnapshotOutputDirectory(w.uri.fsPath);
            if (outputDir && outputDir.toLowerCase() === declaringDirectory) {
                return w;
            }
        }
        return undefined;
    }
    createSnapshotFileSystemWatcher() {
        this.registerForDisposal(vscode.workspace.onDidDeleteFiles(fileDeleteEvent => this.handleAlFileDeleted(fileDeleteEvent)));
        this.registerForDisposal(vscode.workspace.onDidRenameFiles(fileRenamedEvent => this.handleAlFileRenamed(fileRenamedEvent)));
    }
    showSnapshots() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedSnapshot = yield this.SnapshotStatusFilterDelegate();
            if (selectedSnapshot &&
                selectedSnapshot.length > 0) {
                let context = this.requests.get(selectedSnapshot);
                if (context && context.status === SnapshotStatus.Downloaded) {
                    const snapshotFile = this.getSnapshotFilePath(selectedSnapshot);
                    if (!snapshotFile) {
                        return Promise.reject(resources_1.default.snapshotsOutputPathSettingError);
                    }
                    if (!fs_1.existsSync(snapshotFile)) {
                        vscode.window.showErrorMessage(util.format(resources_1.default.snapshotFileNotReady, snapshotFile));
                    }
                    let snapshotDebugger = new snapshotDebugger_1.SnapshotDebugger(this.context);
                    const workspaceFolder = workspaceFolderHelpers_1.getWorkspaceFolderFromPath(context.workspacePath);
                    snapshotDebugger.initialize(workspaceFolder, snapshotFile);
                }
            }
        });
    }
    getSnapshotFilePath(debuggingContext) {
        const context = this.requests.get(debuggingContext);
        if (!context) {
            return undefined;
        }
        const snapshotOutputDirectory = this.getSnapshotOutputDirectory(context.workspacePath);
        if (!snapshotOutputDirectory || snapshotOutputDirectory.length === 0) {
            return undefined;
        }
        return path.join(snapshotOutputDirectory, debuggingContext + constants_1.SnapshotFileNameExtension);
    }
    existsSnapshotFile(debuggingContext) {
        const snapshotFile = this.getSnapshotFilePath(debuggingContext);
        if (!snapshotFile) {
            return false;
        }
        return fs_1.existsSync(snapshotFile);
    }
    selectSnapshot(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let snapshotsWithDate = [];
            for (const startedSnapshot of this.requests) {
                yield this.getSnapshotStatus(startedSnapshot[0]);
                const snapshotContext = startedSnapshot[1];
                if (!filter || this.filterSnapshot(filter, snapshotContext.status)) {
                    let quickPickItem = {
                        label: path.basename(startedSnapshot[0], path.extname(startedSnapshot[0])),
                        detail: this.formatSnapshotData(snapshotContext.debugConfig, snapshotContext.status, snapshotContext.attachKind, new Date(snapshotContext.createdTime).toLocaleString(undefined, constants_1.localeDateTimeOptions)),
                        description: ""
                    };
                    snapshotsWithDate.push({
                        Item: quickPickItem,
                        createdDate: new Date(snapshotContext.createdTime)
                    });
                }
            }
            let snapshots = snapshotsWithDate.sort((a, b) => (b.createdDate.getTime() - a.createdDate.getTime())).map(p => p.Item);
            const options = ({
                placeHolder: resources_1.default.snapshots,
                matchOnDetail: true,
                ignoreFocusOut: true
            });
            return yield vscode.window.showQuickPick(snapshots, options).then(item => item.label);
        });
    }
    filterSnapshot(filter, status) {
        switch (status) {
            case SnapshotStatus.Failed:
                return (filter & SnapshotStatusFilter.Failed) === SnapshotStatusFilter.Failed;
            case SnapshotStatus.Started:
                return (filter & SnapshotStatusFilter.Started) === SnapshotStatusFilter.Started;
            case SnapshotStatus.Initialized:
                return (filter & SnapshotStatusFilter.Initialized) === SnapshotStatusFilter.Initialized;
            case SnapshotStatus.Finished:
                return (filter & SnapshotStatusFilter.Finished) === SnapshotStatusFilter.Finished;
            case SnapshotStatus.Downloaded:
                return (filter & SnapshotStatusFilter.Downloaded) === SnapshotStatusFilter.Downloaded;
            default:
                return false;
        }
    }
    mapToAttachKind(status) {
        switch (status) {
            case 0:
                return AttachKind.Undefined;
            case 1:
                return AttachKind.UserSession;
            case 2:
                return AttachKind.NextSessionForUserOnTenant;
            case 3:
                return AttachKind.NextSessionForUserOnTenant;
        }
        return AttachKind.Undefined;
    }
    mapStatus(status, debuggingContext) {
        switch (status) {
            case 0:
                return SnapshotStatus.Failed;
            case 1:
                return SnapshotStatus.Initialized;
            case 2:
                return SnapshotStatus.Started;
            case 3:
                return this.existsSnapshotFile(debuggingContext) ? SnapshotStatus.Downloaded : SnapshotStatus.Finished;
        }
        return SnapshotStatus.Failed;
    }
    finishSnapshotDebugging() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedSnapshot = yield this.SnapshotStatusFilterDelegate(SnapshotStatusFilter.Started | SnapshotStatusFilter.Initialized | SnapshotStatusFilter.Finished);
            if (!selectedSnapshot ||
                selectedSnapshot.length === 0) {
                return Promise.reject();
            }
            let context = this.requests.get(selectedSnapshot);
            const snapshotOutputDirectory = this.getSnapshotOutputDirectory(context.workspacePath);
            if (!snapshotOutputDirectory || snapshotOutputDirectory.length === 0) {
                return Promise.reject(resources_1.default.snapshotsOutputPathSettingError);
            }
            let config = yield this.ensureAuthenticated(context.debugConfig);
            let params = Object.assign(context.debugConfig, configurationHelpers_1.getAlParams());
            params = Object.assign(params, {
                debuggingContext: selectedSnapshot,
                snapshotOutputDirectory: snapshotOutputDirectory,
                affinityCookie: context.affinityCookie
            });
            yield this.serverProxy.sendServerConnectionRequest(config, params, constants_1.AlFinishSnapshotDebuggerSessionRequest);
            this.updateSerializedSnapshotData(selectedSnapshot);
            this.updateOrDeleteDebuggingContext(selectedSnapshot);
            this.updateDisplay();
        });
    }
    formatSnapshotData(config, status, kind, created) {
        var _a, _b, _c, _d;
        if (status === SnapshotStatus.Failed) {
            return util.format(resources_1.default.snapshotDataWithError, SnapshotStatus[status], (_a = config.configuration.tenant, (_a !== null && _a !== void 0 ? _a : "default")), (_b = config.userId, (_b !== null && _b !== void 0 ? _b : resources_1.default.firstHittingTheTenant)), AttachKind[kind]);
        }
        if (status == SnapshotStatus.Downloaded) {
            return util.format(resources_1.default.snapshotDataForDownloadedSnapshots, SnapshotStatus[status], created);
        }
        return util.format(resources_1.default.snapshotData, SnapshotStatus[status], (_c = config.configuration.tenant, (_c !== null && _c !== void 0 ? _c : "default")), (_d = config.userId, (_d !== null && _d !== void 0 ? _d : resources_1.default.firstHittingTheTenant)), AttachKind[kind]);
    }
    getSnapshotOutputDirectoryFromFolder(w) {
        if (!fs_1.existsSync(w.uri.fsPath)) {
            return undefined;
        }
        const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId, w);
        let snapshotOutputDirectory = alConfig.get("snapshotOutputPath");
        snapshotOutputDirectory = path.join(w.uri.fsPath, snapshotOutputDirectory);
        if (!fs_1.existsSync(snapshotOutputDirectory)) {
            fs_1.mkdirSync(snapshotOutputDirectory);
        }
        return snapshotOutputDirectory;
    }
    initalizeSnapshotDebugging() {
        return __awaiter(this, void 0, void 0, function* () {
            const w = workspaceHelpers.getCurrentWorkspaceFolder();
            if (!w) {
                return Promise.reject('current workspace retrieval error');
            }
            let config = yield this.initalizeDebugAdapterService.mapToDebugConfiguration(false, false, false, initalizeDebugAdapterService_1.DebugConfigurationFilter.SnapshotInitialize);
            if (!config) {
                return Promise.reject('configuration error');
            }
            yield this.ensureAuthenticated(config);
            config.snapPointLocations = this.getBreakpoints();
            const params = Object.assign(config, configurationHelpers_1.getAlParams());
            const result = yield this.serverProxy.sendServerConnectionRequest(config, params, constants_1.AlInitializeSnapshotDebuggerAttachRequest);
            if (result && result.debuggingContext) {
                this.requests.set(result.debuggingContext, {
                    debugConfig: config,
                    workspacePath: w.uri.fsPath,
                    createdTime: new Date(new Date().toUTCString()).toJSON(),
                    affinityCookie: result.affinityCookie,
                    status: SnapshotStatus.Initialized,
                    attachKind: this.mapToAttachKind(result.attachKind)
                });
                this.serializeSnapshotData(result.debuggingContext);
            }
            this.updateDisplay();
        });
    }
    ensureAuthenticated(configuration) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield configurationHelpers_1.ensureAuthenticated(configuration.configuration, this.serverProxy);
        });
    }
    getBreakpoints() {
        let breakpoints = new Map();
        for (const breakpoint of vscode.debug.breakpoints) {
            let sourceBreakpoint = breakpoint;
            if (sourceBreakpoint) {
                const lineStart = sourceBreakpoint.location.range.start.line;
                let breakpointPath = sourceBreakpoint.location.uri.fsPath.toLowerCase();
                if (path.extname(breakpointPath).toLowerCase() === constants_1.DalExtensionName) {
                    breakpointPath = sourceBreakpoint.location.uri.toString().toLowerCase();
                }
                const condition = sourceBreakpoint.condition;
                if (breakpoints.has(breakpointPath)) {
                    breakpoints.get(breakpointPath).push({
                        lineNumber: lineStart,
                        condition: condition
                    });
                }
                else {
                    let lines = [];
                    lines.push({
                        condition: "",
                        lineNumber: lineStart
                    });
                    breakpoints.set(breakpointPath, lines);
                }
            }
        }
        let locations = [];
        for (const breakpoint of breakpoints) {
            locations.push({
                path: breakpoint[0],
                lineContexts: breakpoint[1]
            });
        }
        return locations;
    }
    serializeSnapshotData(debuggingContext) {
        const context = this.requests.get(debuggingContext);
        const outputFolder = this.getSnapshotOutputDirectory(context.workspacePath);
        if (!outputFolder) {
            return;
        }
        const snapshotsFileName = path.join(outputFolder, constants_1.SnapshotJSONFileName);
        const snapshotContext = {
            debugConfig: {
                type: context.debugConfig.type,
                request: context.debugConfig.request,
                name: context.debugConfig.name,
                configuration: context.debugConfig.configuration,
                userId: context.debugConfig.userId,
                sessionId: context.debugConfig.sessionId
            },
            workspacePath: context.workspacePath,
            createdTime: context.createdTime,
            affinityCookie: context.affinityCookie,
            status: context.status,
            attachKind: context.attachKind
        };
        const data = {
            debuggingContext: debuggingContext,
            snapshotContext: snapshotContext
        };
        let snapshotserializedData = [];
        if (fs_1.existsSync(snapshotsFileName)) {
            const existingContent = fs_1.readFileSync(snapshotsFileName, "utf-8");
            snapshotserializedData = JSON.parse(existingContent);
        }
        snapshotserializedData.push(data);
        const fileContent = JSON.stringify(snapshotserializedData, null, "  ");
        fs_1.writeFileSync(snapshotsFileName, fileContent, "utf-8");
    }
    deserializeSnapshotData() {
        for (const w of vscode.workspace.workspaceFolders) {
            const outputDirectory = this.getSnapshotOutputDirectoryFromFolder(w);
            if (!outputDirectory) {
                continue;
            }
            const snapshotsFileName = path.join(outputDirectory, constants_1.SnapshotJSONFileName);
            if (!fs_1.existsSync(snapshotsFileName)) {
                continue;
            }
            const content = fs_1.readFileSync(snapshotsFileName, "utf-8");
            try {
                const snapshotserializedData = JSON.parse(content);
                const newContent = [];
                for (const data of snapshotserializedData) {
                    const snapshotFile = path.join(outputDirectory, data.debuggingContext + constants_1.SnapshotFileNameExtension);
                    if (!fs_1.existsSync(snapshotFile)) {
                        const now = new Date().getTime();
                        const then = new Date(data.snapshotContext.createdTime).getTime();
                        if (now - then < constants_1.DeserializeSnapshotContextInterval) {
                            this.requests.set(data.debuggingContext, {
                                debugConfig: data.snapshotContext.debugConfig,
                                workspacePath: data.snapshotContext.workspacePath,
                                affinityCookie: data.snapshotContext.affinityCookie,
                                createdTime: data.snapshotContext.createdTime,
                                status: data.snapshotContext.status,
                                attachKind: data.snapshotContext.attachKind
                            });
                            newContent.push(data);
                        }
                    }
                }
                const fileContent = JSON.stringify(newContent, null, "  ");
                fs_1.writeFileSync(snapshotsFileName, fileContent, "utf-8");
            }
            catch (_a) {
            }
        }
    }
    updateWithExistingSnapshots() {
        for (const w of vscode.workspace.workspaceFolders) {
            const outputDirectory = this.getSnapshotOutputDirectoryFromFolder(w);
            if (!outputDirectory) {
                continue;
            }
            fs.readdirSync(outputDirectory).forEach(file => {
                if (file.endsWith(constants_1.SnapshotFileNameExtension)) {
                    const snapshotFileName = path.basename(file, constants_1.SnapshotFileNameExtension);
                    const context = this.requests.get(snapshotFileName);
                    if (!context) {
                        const fullPath = path.join(outputDirectory, file);
                        const stat = fs.statSync(fullPath);
                        this.requests.set(snapshotFileName, {
                            status: SnapshotStatus.Downloaded,
                            affinityCookie: '',
                            attachKind: AttachKind.Undefined,
                            createdTime: new Date(stat.birthtime).toJSON(),
                            workspacePath: w.uri.fsPath,
                            debugConfig: {
                                request: initalizeDebugAdapterService_1.DebugConfigurationType.Launch,
                                name: resources_1.default.defaultSnapshotDebuggerConfigurationName,
                                type: constants_1.AlLanguageId,
                                snapshotFileName: (snapshotFileName + constants_1.SnapshotFileNameExtension)
                            }
                        });
                    }
                }
            });
        }
    }
    updateOrDeleteDebuggingContext(debuggingContext) {
        const context = this.requests.get(debuggingContext);
        if (this.existsSnapshotFile(debuggingContext)) {
            context.status = SnapshotStatus.Downloaded;
        }
        else {
            this.requests.delete(debuggingContext);
        }
    }
    getSnapshotOutputDirectoryFromDebuggingContext(debuggingContext) {
        const context = this.requests.get(debuggingContext);
        if (!context) {
            return undefined;
        }
        return this.getSnapshotOutputDirectory(context.workspacePath);
    }
    updateSerializedSnapshotData(debuggingContext) {
        const outputFolder = this.getSnapshotOutputDirectoryFromDebuggingContext(debuggingContext);
        if (!outputFolder) {
            return;
        }
        const snapshotJSONFileName = path.join(outputFolder, constants_1.SnapshotJSONFileName);
        let snapshotserializedData = [];
        if (fs_1.existsSync(snapshotJSONFileName)) {
            const existingContent = fs_1.readFileSync(snapshotJSONFileName, "utf-8");
            snapshotserializedData = JSON.parse(existingContent);
        }
        let newData = [];
        for (let data of snapshotserializedData) {
            if (data.debuggingContext !== debuggingContext) {
                newData.push(data);
            }
            else if (this.existsSnapshotFile(debuggingContext)) {
                data.snapshotContext.status = SnapshotStatus.Downloaded;
                newData.push(data);
            }
        }
        const fileContent = JSON.stringify(newData, null, "  ");
        fs_1.writeFileSync(snapshotJSONFileName, fileContent, "utf-8");
    }
    updatedebuggingContextInSerializedSnapshotData(oldDebuggingContext, newDebuggingContext) {
        const outputFolder = this.getSnapshotOutputDirectoryFromDebuggingContext(newDebuggingContext);
        if (!outputFolder) {
            return;
        }
        const snapshotJSONFileName = path.join(outputFolder, constants_1.SnapshotJSONFileName);
        let snapshotserializedData = [];
        if (fs_1.existsSync(snapshotJSONFileName)) {
            const existingContent = fs_1.readFileSync(snapshotJSONFileName, "utf-8");
            snapshotserializedData = JSON.parse(existingContent);
            for (let data of snapshotserializedData) {
                if (data.debuggingContext === oldDebuggingContext) {
                    data.debuggingContext = newDebuggingContext;
                }
            }
            const fileContent = JSON.stringify(snapshotserializedData, null, "  ");
            fs_1.writeFileSync(snapshotJSONFileName, fileContent, "utf-8");
        }
    }
    removeDebuggingContextFromSerializedSnapshotData(debuggingContext) {
        const outputFolder = this.getSnapshotOutputDirectoryFromDebuggingContext(debuggingContext);
        if (!outputFolder) {
            return;
        }
        const snapshotJSonFileName = path.join(outputFolder, constants_1.SnapshotJSONFileName);
        let snapshotserializedData = [];
        if (fs_1.existsSync(snapshotJSonFileName)) {
            const existingContent = fs_1.readFileSync(snapshotJSonFileName, "utf-8");
            snapshotserializedData = JSON.parse(existingContent);
            let newData = [];
            for (let data of snapshotserializedData) {
                if (data.debuggingContext !== debuggingContext) {
                    newData.push(data);
                }
            }
            const fileContent = JSON.stringify(newData, null, "  ");
            fs_1.writeFileSync(snapshotJSonFileName, fileContent, "utf-8");
        }
    }
    updateDisplay() {
        this.statusBar.text = '$(debug-alt): ' + this.requests.size;
        this.statusBar.command = "al.snapshots";
        this.statusBar.tooltip = resources_1.default.snapshots;
        let displayColor = '';
        for (const snapshot of this.requests) {
            if (snapshot[1].status === SnapshotStatus.Downloaded) {
                displayColor = 'orange';
                break;
            }
        }
        this.statusBar.color = displayColor;
        this.statusBar.show();
    }
}
exports.SnapshotDebuggerService = SnapshotDebuggerService;
//# sourceMappingURL=snapshotDebuggerService.js.map