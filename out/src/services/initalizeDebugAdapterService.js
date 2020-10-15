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
const fs = require("fs");
const path = require("path");
const util = require("util");
const vscode = require("vscode");
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const fsHelpers_1 = require("../fsHelpers");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const vscodeHelpers_1 = require("../vscodeHelpers");
const workspaceHelpers = require("../workspaceFolderHelpers");
const alDebugConfigurationProvider_1 = require("./alDebugConfigurationProvider");
const extensionService_1 = require("./extensionService");
const constants_2 = require("../constants");
const alDebugAdapterDescriptorFactory_1 = require("./alDebugAdapterDescriptorFactory");
const snapshotDebugger_1 = require("./snapshotDebugger");
const LaunchFilePath = ".vscode/launch.json";
const LaunchFileVersion = "0.2.0";
var DebugConfigurationType;
(function (DebugConfigurationType) {
    DebugConfigurationType["Launch"] = "launch";
    DebugConfigurationType["Attach"] = "attach";
    DebugConfigurationType["SnapshotInitialize"] = "snapshotInitialize";
})(DebugConfigurationType = exports.DebugConfigurationType || (exports.DebugConfigurationType = {}));
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType[EnvironmentType["Undefined"] = 0] = "Undefined";
    EnvironmentType[EnvironmentType["OnPrem"] = 1] = "OnPrem";
    EnvironmentType[EnvironmentType["Sandbox"] = 2] = "Sandbox";
    EnvironmentType[EnvironmentType["Production"] = 3] = "Production";
})(EnvironmentType = exports.EnvironmentType || (exports.EnvironmentType = {}));
const CloudConfig = {
    name: "Microsoft cloud sandbox",
    request: DebugConfigurationType.Launch,
    type: constants_1.AlLanguageId,
    environmentType: "Sandbox",
    environmentName: 'sandbox',
    startupObjectId: 22,
    startupObjectType: "Page",
    breakOnError: true,
    launchBrowser: true,
    enableLongRunningSqlStatements: true,
    enableSqlInformationDebugger: true
};
const LocalConfig = {
    name: "Your own server",
    request: DebugConfigurationType.Launch,
    type: constants_1.AlLanguageId,
    environmentType: "OnPrem",
    server: "http://localhost",
    serverInstance: "BC170",
    authentication: "UserPassword",
    startupObjectId: 22,
    startupObjectType: "Page",
    breakOnError: true,
    launchBrowser: true,
    enableLongRunningSqlStatements: true,
    enableSqlInformationDebugger: true,
    tenant: "default"
};
var BreakOnNext;
(function (BreakOnNext) {
    BreakOnNext[BreakOnNext["WebServiceClient"] = 0] = "WebServiceClient";
    BreakOnNext[BreakOnNext["WebClient"] = 1] = "WebClient";
    BreakOnNext[BreakOnNext["Background"] = 2] = "Background";
})(BreakOnNext = exports.BreakOnNext || (exports.BreakOnNext = {}));
var SnapshotVerbosity;
(function (SnapshotVerbosity) {
    SnapshotVerbosity[SnapshotVerbosity["SnapPoint"] = 0] = "SnapPoint";
    SnapshotVerbosity[SnapshotVerbosity["Full"] = 1] = "Full";
})(SnapshotVerbosity = exports.SnapshotVerbosity || (exports.SnapshotVerbosity = {}));
var DependencyPublishingOption;
(function (DependencyPublishingOption) {
    DependencyPublishingOption[DependencyPublishingOption["Default"] = 0] = "Default";
    DependencyPublishingOption[DependencyPublishingOption["Ignore"] = 1] = "Ignore";
    DependencyPublishingOption[DependencyPublishingOption["Strict"] = 2] = "Strict";
})(DependencyPublishingOption = exports.DependencyPublishingOption || (exports.DependencyPublishingOption = {}));
var DebugConfigurationFilter;
(function (DebugConfigurationFilter) {
    DebugConfigurationFilter[DebugConfigurationFilter["Launch"] = 1] = "Launch";
    DebugConfigurationFilter[DebugConfigurationFilter["Attach"] = 2] = "Attach";
    DebugConfigurationFilter[DebugConfigurationFilter["SnapshotInitialize"] = 4] = "SnapshotInitialize";
    DebugConfigurationFilter[DebugConfigurationFilter["All"] = 7] = "All";
})(DebugConfigurationFilter = exports.DebugConfigurationFilter || (exports.DebugConfigurationFilter = {}));
/**
 * The service responsible for working with launch.json file - generating it, reading configurations, etc.
 */
class InitializeDebugAdapterService extends extensionService_1.ExtensionService {
    constructor(context, isConfigurationSetValue, projectDependencyHandlerService) {
        super(context);
        this.isConfigurationSetValue = isConfigurationSetValue;
        this.projectDependencyHandlerService = projectDependencyHandlerService;
    }
    set ProjectDependencyHandlerService(dependency) {
        this.projectDependencyHandlerService = dependency;
    }
    get ProjectDependencyHandlerService() {
        return this.projectDependencyHandlerService;
    }
    activate() {
        let disposable = vscode.debug.registerDebugConfigurationProvider(constants_1.AlLanguageId, new alDebugConfigurationProvider_1.AlDebugConfigurationProvider(this));
        this.registerForDisposal(disposable);
        const alDebugAdapterDescriptorFactory = new alDebugAdapterDescriptorFactory_1.AlDebugAdapterDescriptorFactory(this.context);
        disposable = vscode.debug.registerDebugAdapterDescriptorFactory(constants_1.AlLanguageId, alDebugAdapterDescriptorFactory);
        this.registerForDisposal(disposable);
    }
    getDebugAdapterConfiguration(filter) {
        this.isConfigurationSetValue = false;
        const configurations = this.getConfigurations(filter);
        if (configurations.length === 0) {
            this.generateLaunchJson()
                .then(success => {
                if (success) {
                    this.openLaunchJson();
                }
            });
            return Promise.reject(new Error(resources_2.default.noLaunchFileWarning));
        }
        return new Promise((resolve, reject) => {
            if (configurations.length === 1) {
                return resolve(configurations[0]);
            }
            else {
                return this.chooseDebugConfiguration(configurations).then(configurationChosen => resolve(configurationChosen), reject);
            }
        });
    }
    mapToDebugConfiguration(publishOnly, isRad, justDebug, filter) {
        return this.getDebugAdapterConfiguration(filter).then((configuration) => __awaiter(this, void 0, void 0, function* () {
            return yield this.resolveDebugConfiguration(publishOnly, isRad, justDebug, configuration);
        }));
    }
    resolveDebugConfiguration(publishOnly, isRad, justDebug, configuration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (justDebug) {
                publishOnly = false;
                isRad = false;
            }
            if (publishOnly) {
                justDebug = false;
            }
            let sqlDebugConfigurationOptions = this.getSqlConfigurationValues(configuration);
            let debugConfig = null;
            let port = configuration.port;
            const currentWorkspace = workspaceHelpers.getCurrentWorkspaceFolder();
            if (configuration.request === DebugConfigurationType.Launch || configuration.request === DebugConfigurationType.Attach) {
                const projectReferenceDefinitions = yield this.projectDependencyHandlerService.getProjectReferences(currentWorkspace);
                if (!port) {
                    port = constants_1.DefaultDevEndpointPort;
                }
                if (configuration.request === DebugConfigurationType.Launch) {
                    debugConfig = {
                        name: configuration.name,
                        type: constants_1.AlLanguageId,
                        request: configuration.request,
                        publishOnly: publishOnly,
                        isRad: isRad,
                        justDebug: justDebug,
                        authentication: configuration.authentication,
                        port: port,
                        schemaUpdateMode: configuration.schemaUpdateMode,
                        server: configuration.server,
                        serverInstance: configuration.serverInstance,
                        startupObjectId: configuration.startupObjectId,
                        startupObjectType: configuration.startupObjectType,
                        tenant: configuration.tenant,
                        applicationFamily: configuration.applicationFamily,
                        breakOnError: configuration.breakOnError,
                        breakOnRecordWrite: configuration.breakOnRecordWrite,
                        skipSystemTriggers: configuration.skipSystemTriggers,
                        launchBrowser: configuration.launchBrowser,
                        enableSqlInformationDebugger: sqlDebugConfigurationOptions.enableSqlInformationDebugger,
                        enableLongRunningSqlStatements: sqlDebugConfigurationOptions.enableLongRunningSqlStatements,
                        longRunningSqlStatementsThreshold: sqlDebugConfigurationOptions.longRunningSqlStatementsThreshold,
                        numberOfSqlStatements: sqlDebugConfigurationOptions.numberOfSqlStatements,
                        traceDap: configuration.traceDap,
                        sandboxName: configuration.sandboxName,
                        projectReferenceDefinitions: projectReferenceDefinitions,
                        dependencyPublishingOption: configuration.dependencyPublishingOption,
                        disableHttpRequestTimeout: configuration.disableHttpRequestTimeout,
                        deploymentId: configuration.deploymentId,
                        forceUpgrade: configuration.forceUpgrade,
                        useSystemSessionForDeployment: configuration.useSystemSessionForDeployment,
                        snapshotFileName: configuration.snapshotFileName,
                        environmentType: configuration.environmentType,
                        environmentName: configuration.environmentName,
                        environment: configuration.environment,
                    };
                }
                else {
                    let breakOnNext = configuration.breakOnNext == undefined ? BreakOnNext.WebServiceClient : configuration.breakOnNext;
                    debugConfig = {
                        name: configuration.name,
                        type: constants_1.AlLanguageId,
                        request: configuration.request,
                        authentication: configuration.authentication,
                        port: port,
                        server: configuration.server,
                        serverInstance: configuration.serverInstance,
                        tenant: configuration.tenant,
                        applicationFamily: configuration.applicationFamily,
                        breakOnError: configuration.breakOnError,
                        breakOnRecordWrite: configuration.breakOnRecordWrite,
                        enableSqlInformationDebugger: sqlDebugConfigurationOptions.enableSqlInformationDebugger,
                        enableLongRunningSqlStatements: sqlDebugConfigurationOptions.enableLongRunningSqlStatements,
                        longRunningSqlStatementsThreshold: sqlDebugConfigurationOptions.longRunningSqlStatementsThreshold,
                        numberOfSqlStatements: sqlDebugConfigurationOptions.numberOfSqlStatements,
                        breakOnNext: breakOnNext,
                        traceDap: configuration.traceDap,
                        sandboxName: configuration.sandboxName,
                        disableHttpRequestTimeout: configuration.disableHttpRequestTimeout,
                        deploymentId: configuration.deploymentId,
                        forceUpgrade: configuration.forceUpgrade,
                        useSystemSessionForDeployment: configuration.useSystemSessionForDeployment,
                        environmentType: configuration.environmentType,
                        environmentName: configuration.environmentName,
                        environment: configuration.environment,
                    };
                }
            }
            else if (configuration.request === DebugConfigurationType.SnapshotInitialize) {
                let clientType = configuration.breakOnNext === undefined ? BreakOnNext.WebServiceClient : configuration.breakOnNext;
                let sessionId = configuration.sessionId === undefined ? -1 : configuration.sessionId;
                let snapshotVerbosity = configuration.snapshotVerbosity === undefined ? SnapshotVerbosity.Full : configuration.snapshotVerbosity;
                if (!port) {
                    port = constants_1.DefaultSnapshotEndpointPort;
                }
                debugConfig = {
                    configuration: {
                        authentication: configuration.authentication,
                        server: configuration.server,
                        serverInstance: configuration.serverInstance,
                        port: port,
                        tenant: configuration.tenant,
                        applicationFamily: configuration.applicationFamily,
                        sandboxName: configuration.sandboxName,
                        disableHttpRequestTimeout: configuration.disableHttpRequestTimeout,
                        deploymentId: configuration.deploymentId,
                        environment: configuration.environment,
                        name: configuration.name,
                        request: configuration.request,
                        environmentType: configuration.environmentType,
                        environmentName: configuration.environmentName
                    },
                    name: configuration.name,
                    type: constants_1.AlLanguageId,
                    request: configuration.request,
                    userId: configuration.userId,
                    clientType: clientType,
                    sessionId: sessionId,
                    snapshotVerbosity: snapshotVerbosity
                };
            }
            this.isConfigurationSetValue = true;
            return Promise.resolve(debugConfig);
        });
    }
    isConfigurationSet() {
        return this.isConfigurationSetValue;
    }
    isConfigured() {
        if (!vscode.workspace.workspaceFolders) {
            return false;
        }
        const w = this.getCurrentLaunchFilePath();
        if (!w) {
            return false;
        }
        return fs.existsSync(w);
    }
    isDirty() {
        const w = this.getCurrentLaunchFilePath();
        if (!w) {
            return false;
        }
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.isDirty && doc.fileName === w) {
                return true;
            }
        }
        return false;
    }
    getConfigurations(filter) {
        if (!this.isConfigured()) {
            return [];
        }
        const w = this.getCurrentLaunchFilePath();
        if (!w) {
            return [];
        }
        if (!filter) {
            filter = DebugConfigurationFilter.Launch;
        }
        const configurations = this.getConfigurationsImpl(filter, w);
        if (!Array.isArray(configurations)) {
            vscode.window.showErrorMessage(util.format(resources_2.default.jsonMalformedError, LaunchFilePath));
            return [];
        }
        if (configurations.length === 0 || configurations.length === 1 && configurations[0] === undefined) {
            vscode.window.showErrorMessage(util.format(resources_2.default.noConfigAvailable, this.mapFilterToString(filter)));
            return [];
        }
        const alParams = configurationHelpers_1.getAlParams();
        for (const alConfig of configurations) {
            alConfig.environment = alParams.environmentInfo.env;
        }
        return configurations;
    }
    generateLaunchJson() {
        const filePath = this.getCurrentLaunchFilePath();
        if (!filePath) {
            return Promise.reject(resources_1.default.noActiveWorkspaceFolder);
        }
        return fsHelpers_1.existsFileAsync(filePath)
            .then(exists => {
            if (exists) {
                return filePath;
            }
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                try {
                    fs.mkdirSync(dir);
                }
                catch (e) {
                    return null;
                }
            }
            return this.getInitialFileContent()
                .then(config => this.tryUpdate(config))
                .then(() => filePath);
        });
    }
    openLaunchJson() {
        const w = this.getCurrentLaunchFilePath();
        if (!w) {
            Promise.reject(resources_1.default.noActiveWorkspaceFolder);
        }
        return vscodeHelpers_1.openTextDocument(w);
    }
    formatLaunchConfiguration(config) {
        if (config.server) {
            return util.format(resources_2.default.serverFormat, config.server, config.serverInstance, config.tenant || "default");
        }
        return resources_2.default.cloudServer;
    }
    getInitialConfigurations() {
        return this.getLocalConfig()
            .catch(() => LocalConfig)
            .then(localConfig => this.chooseDebugConfiguration([CloudConfig, localConfig])
            .catch(() => localConfig)
            .then(config => [config]));
    }
    updateSnapshotDebugConfiguration(folder, config) {
        var _a;
        if (!snapshotDebugger_1.isSnapshotDebuggerConfiguration(config)) {
            return;
        }
        let inputFileName = config.snapshotFileName;
        if (!inputFileName) {
            return;
        }
        const launchFile = vscode.workspace.getConfiguration(DebugConfigurationType.Launch, folder);
        if (!launchFile) {
            return;
        }
        inputFileName = inputFileName.toLowerCase();
        const configs = launchFile.get("configurations");
        if (!configs) {
            return;
        }
        let found = false;
        for (const debugConfig of configs) {
            if (snapshotDebugger_1.isSnapshotDebuggerConfiguration(debugConfig)) {
                const existingSnapshotConfigFileName = debugConfig.snapshotFileName;
                if (((_a = existingSnapshotConfigFileName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === inputFileName) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            configs.push(config);
            launchFile.update("configurations", configs);
        }
    }
    chooseDebugConfiguration(configurations) {
        return new Promise((resolve, reject) => {
            let configurationsWithName = configurations.map(x => {
                return ({
                    label: x.name,
                    detail: this.formatLaunchConfiguration(x),
                    description: ""
                });
            });
            if (configurationsWithName.length == 1) {
                const quickPickItemLabel = configurationsWithName[0].label.toLowerCase();
                const index = configurations.findIndex(c => c.name.toLowerCase() === quickPickItemLabel);
                return resolve(configurations[index]);
            }
            else {
                const options = ({
                    placeHolder: resources_1.default.chooseServerPrompt,
                    matchOnDetail: true,
                    ignoreFocusOut: true
                });
                return vscode.window.showQuickPick(configurationsWithName, options).then(item => {
                    if (item) {
                        const i = configurationsWithName.indexOf(item);
                        if (i !== -1) {
                            return configurations[i];
                        }
                        else {
                            reject();
                        }
                    }
                }).then((config) => {
                    if (config) {
                        return resolve(config);
                    }
                    else {
                        reject();
                    }
                });
            }
        });
    }
    getLocalConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const configuration = LocalConfig;
            configuration.serverInstance = yield this.getServerInstanceForLocalLaunchConfiguration();
            return configuration;
        });
    }
    getCurrentLaunchFilePath() {
        const currentFolder = workspaceHelpers.getCurrentWorkspaceFolderPath();
        return this.getLaunchFilePath(currentFolder);
    }
    getLaunchFilePath(workspaceFolderPath) {
        if (workspaceFolderPath) {
            return path.join(workspaceFolderPath, LaunchFilePath);
        }
    }
    getServerInstanceForLocalLaunchConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentFolder = workspaceHelpers.getCurrentWorkspaceFolderPath();
            const workspaceUri = vscode.Uri.file(path.join(currentFolder, constants_2.AlProjectFileName));
            if (fs.existsSync(workspaceUri.fsPath)) {
                const document = yield vscode.workspace.openTextDocument(workspaceUri);
                const asText = document.getText();
                try {
                    const asJson = JSON.parse(asText);
                    if (asJson != null) {
                        return Promise.resolve(this.getServerInstanceByRuntime(asJson.runtime));
                    }
                }
                catch (_a) { }
            }
            return Promise.resolve(this.getServerInstanceByRuntime());
        });
    }
    getServerInstanceByRuntime(runtime = null) {
        switch (runtime) {
            case "1.0":
                return "BC120";
            case "2.0":
                return "BC130";
            case "3.0":
                return "BC140";
            case "4.0":
                return "BC150";
            case "5.0":
                return "BC160";
            case "6.0":
            default:
                return "BC170";
        }
    }
    getInitialFileContent() {
        return this.getInitialConfigurations()
            .then(configs => {
            const initialConfigurations = {
                version: LaunchFileVersion,
                configurations: configs
            };
            return initialConfigurations;
        });
    }
    getConfigurationTarget() {
        return vscode.workspace.workspaceFolders.length > 1 ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Workspace;
    }
    tryUpdate(config) {
        const w = workspaceHelpers.getCurrentWorkspaceFolderPath();
        const configuration = vscode.workspace.getConfiguration(null, vscode.Uri.file(w));
        if (vscode.workspace.workspaceFolders.length !== 1) {
            return configuration.update(DebugConfigurationType.Launch, config, this.getConfigurationTarget());
        }
        // weird scenario when we have one folder and we do not know if it is a workspacefolder.
        return configuration.update(DebugConfigurationType.Launch, config, vscode.ConfigurationTarget.Workspace)
            .then(() => { }, (reason) => configuration.update(DebugConfigurationType.Launch, config, vscode.ConfigurationTarget.WorkspaceFolder));
    }
    getSqlConfigurationValues(configuration) {
        return {
            enableSqlInformationDebugger: configuration.enableSqlInformationDebugger === undefined ? true : configuration.enableSqlInformationDebugger,
            enableLongRunningSqlStatements: configuration.enableLongRunningSqlStatements === undefined ? true : configuration.enableLongRunningSqlStatements,
            longRunningSqlStatementsThreshold: configuration.longRunningSqlStatementsThreshold === undefined ? 500 : configuration.longRunningSqlStatementsThreshold,
            numberOfSqlStatements: configuration.numberOfSqlStatements === undefined ? 10 : configuration.numberOfSqlStatements,
        };
    }
    getConfigurationsImpl(filter, launchFilePath) {
        const fileUri = vscode.Uri.file(launchFilePath);
        let configs = this.getDebugConfigurations(fileUri);
        const alConfigurations = configs.filter(x => {
            let isAlType = x.type === constants_1.AlLanguageId;
            if (!isAlType) {
                return false;
            }
            switch (x.request) {
                case DebugConfigurationType.Launch:
                    return (filter & DebugConfigurationFilter.Launch) === DebugConfigurationFilter.Launch;
                case DebugConfigurationType.Attach:
                    return (filter & DebugConfigurationFilter.Attach) === DebugConfigurationFilter.Attach;
                case DebugConfigurationType.SnapshotInitialize:
                    return (filter & DebugConfigurationFilter.SnapshotInitialize) === DebugConfigurationFilter.SnapshotInitialize;
                default:
                    return false;
            }
        });
        return alConfigurations;
    }
    getDebugConfigurations(fileUri) {
        // This is the weirdest API ever existed. The getConfiguration ONLY accepts
        // DebugConfigurationType.Launch and will return all configurations, including snapshot and attach configs
        const config = vscode.workspace.getConfiguration(DebugConfigurationType.Launch, fileUri);
        if (config) {
            return config.get("configurations");
        }
        return [];
    }
    mapFilterToString(filter) {
        let type = "";
        if (filter & DebugConfigurationFilter.Launch) {
            type += DebugConfigurationType.Launch + " ";
        }
        if (filter & DebugConfigurationFilter.Attach) {
            type += DebugConfigurationType.Attach + " ";
        }
        if (filter & DebugConfigurationFilter.SnapshotInitialize) {
            type += DebugConfigurationType.SnapshotInitialize + " ";
        }
        return type;
    }
}
exports.InitializeDebugAdapterService = InitializeDebugAdapterService;
//# sourceMappingURL=initalizeDebugAdapterService.js.map