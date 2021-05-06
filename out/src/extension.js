"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const uuid = require("uuid");
const vscode = require("vscode");
const constants_1 = require("./constants");
const extensionContext_1 = require("./extensionContext");
const alDefinitionProvider_1 = require("./services/alDefinitionProvider");
const AlExtensionExports_1 = require("./services/AlExtensionExports");
const bootstrapService_1 = require("./services/bootstrapService");
const buildService_1 = require("./services/buildService");
const contentService_1 = require("./services/contentService");
const downloadSourceService_1 = require("./services/downloadSourceService");
const editorService_1 = require("./services/editorService");
const initalizeDebugAdapterService_1 = require("./services/initalizeDebugAdapterService");
const openEventRecorderService_1 = require("./services/openEventRecorderService");
const insertEventSubscriberService_1 = require("./services/insertEventSubscriberService");
const openExternallyService_1 = require("./services/openExternallyService");
const openPageDesignerService_1 = require("./services/openPageDesignerService");
const permissionSetService_1 = require("./services/permissionSetService");
const referenceContentProvider_1 = require("./services/referenceContentProvider");
const symbolsDownloader_1 = require("./services/symbolsDownloader");
const symbolsService_1 = require("./services/symbolsService");
const configurationService_1 = require("./services/configurationService");
const status_1 = require("./status");
const projectDependencyHandlerservice_1 = require("./services/projectDependencyHandlerservice");
const AlLanguageClientBreakpointCleanupHandlerService_1 = require("./services/AlLanguageClientBreakpointCleanupHandlerService");
const registerEvaluatableExpressionProvider_1 = require("./services/registerEvaluatableExpressionProvider");
const publishingService_1 = require("./services/publishingService");
const snapshotDebuggerService_1 = require("./services/snapshotDebuggerService");
const serverProxy_1 = require("./services/serverProxy");
const docCommentService_1 = require("./services/docCommentService");
let extension = null;
function activate(context) {
    updateUserIdIfNeeded(context);
    extension = new AlExtension();
    const exports = extension.activateServices(context);
    vscode.commands.executeCommand("setContext", constants_1.AlExtensionContextName, true);
    return exports;
}
exports.activate = activate;
function deactivate() {
    vscode.commands.executeCommand("setContext", constants_1.AlExtensionContextName, false);
}
exports.deactivate = deactivate;
class AlExtension {
    constructor() {
        this.services = [];
    }
    activateServices(context) {
        const contextImpl = new extensionContext_1.ExtensionContextImpl(context);
        const initalizeDebugAdapterService = new initalizeDebugAdapterService_1.InitializeDebugAdapterService(contextImpl, false, null, null);
        this.services.push(initalizeDebugAdapterService);
        const editorService = new editorService_1.EditorService(contextImpl, initalizeDebugAdapterService);
        this.services.push(editorService);
        const languageServerClient = editorService.tryStartLanguageServer();
        let preferredChannel = null;
        if (languageServerClient) {
            preferredChannel = languageServerClient.outputChannel;
        }
        status_1.initializeOuputChannel(preferredChannel);
        const symbolsDownloader = new symbolsDownloader_1.SymbolsDownloader(languageServerClient);
        const symbolsService = new symbolsService_1.SymbolsService(contextImpl, initalizeDebugAdapterService, symbolsDownloader, editorService);
        this.services.push(symbolsService);
        const contentService = new contentService_1.ContentService(contextImpl, languageServerClient);
        this.services.push(contentService);
        const docCommentService = new docCommentService_1.DocCommentService(contextImpl);
        this.services.push(docCommentService);
        const bootstrapService = new bootstrapService_1.BootstrapService(contextImpl, initalizeDebugAdapterService, symbolsService, contentService);
        this.services.push(bootstrapService);
        const downloadSourceService = new downloadSourceService_1.DownloadSourceService(contextImpl, initalizeDebugAdapterService, languageServerClient);
        this.services.push(downloadSourceService);
        const projectDependencyHandlerService = new projectDependencyHandlerservice_1.ProjectDependencyHandlerService(contextImpl, languageServerClient);
        initalizeDebugAdapterService.ProjectDependencyHandlerService = projectDependencyHandlerService;
        this.services.push(projectDependencyHandlerService);
        const snapshotDebuggerService = new snapshotDebuggerService_1.SnapshotDebuggerService(contextImpl, new serverProxy_1.ServerProxy(languageServerClient), initalizeDebugAdapterService);
        this.services.push(snapshotDebuggerService);
        const buildService = new buildService_1.BuildService(contextImpl, languageServerClient, symbolsService, initalizeDebugAdapterService, editorService, projectDependencyHandlerService);
        initalizeDebugAdapterService.BuildService = buildService;
        this.services.push(buildService);
        const openPageService = new openPageDesignerService_1.OpenPageDesignerService(contextImpl, initalizeDebugAdapterService, languageServerClient, buildService);
        this.services.push(openPageService);
        const referenceContentProvider = new referenceContentProvider_1.ReferenceContentProvider(contextImpl, languageServerClient);
        this.services.push(referenceContentProvider);
        const alDefinitionProvider = new alDefinitionProvider_1.AlDefinitionProvider(contextImpl, languageServerClient, initalizeDebugAdapterService);
        this.services.push(alDefinitionProvider);
        const openExternallyService = new openExternallyService_1.OpenExternallyService(contextImpl);
        this.services.push(openExternallyService);
        const permissionSetGeneratorService = new permissionSetService_1.PermissionSetService(contextImpl, languageServerClient);
        this.services.push(permissionSetGeneratorService);
        const publishingService = new publishingService_1.PublishingService(contextImpl);
        this.services.push(publishingService);
        const openEventRecorderService = new openEventRecorderService_1.OpenEventRecorderService(contextImpl, initalizeDebugAdapterService, languageServerClient);
        this.services.push(openEventRecorderService);
        const insertEventSubscriberService = new insertEventSubscriberService_1.InsertEventSubscriberService(contextImpl, languageServerClient);
        this.services.push(insertEventSubscriberService);
        const configurationService = new configurationService_1.ConfigurationService(contextImpl, languageServerClient);
        this.services.push(configurationService);
        const breakpointCleanupHandler = new AlLanguageClientBreakpointCleanupHandlerService_1.AlLanguageClientBreakpointCleanupHandlerService(contextImpl);
        this.services.push(breakpointCleanupHandler);
        const registerEvaluatableExpressionProvider = new registerEvaluatableExpressionProvider_1.RegisterEvaluatableExpressionProvider(contextImpl);
        this.services.push(registerEvaluatableExpressionProvider);
        editorService.projectDependencyService = projectDependencyHandlerService;
        this.services.forEach(x => x.activate());
        return new AlExtensionExports_1.AlExtensionExports(languageServerClient, this.services);
    }
}
exports.AlExtension = AlExtension;
/**
 * Synchronizes the anonymous user ID between a local file and global workspace state, if necessary.
 * The global workspace state is preserved over vscode updates, so it is more durable than local extension file.
 * The user ID should then be read by the language server or debug service when sending telemetry.
 */
function updateUserIdIfNeeded(context) {
    try {
        const path = context.asAbsolutePath(constants_1.UserIdFile);
        let userId = context.globalState.get(constants_1.UserIdStateKey);
        if (fs.existsSync(path)) {
            if (!userId) {
                userId = fs.readFileSync(path, "utf-8");
                context.globalState.update(constants_1.UserIdStateKey, userId);
            }
        }
        else {
            if (!userId) {
                userId = uuid.v4();
                context.globalState.update(constants_1.UserIdStateKey, userId);
            }
            fs.writeFileSync(path, userId, { encoding: "utf-8" });
        }
    }
    catch (e) {
        // ignore
    }
}
//# sourceMappingURL=extension.js.map