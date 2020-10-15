"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configurationHelpers_1 = require("../configurationHelpers");
const resources_1 = require("../resources");
const status_1 = require("../status");
const extensionService_1 = require("./extensionService");
const initalizeDebugAdapterService_1 = require("./initalizeDebugAdapterService");
const snapshotDebugger_1 = require("./snapshotDebugger");
const constants_1 = require("../constants");
/**
 * The service responsible for working with reference symbols.
 */
class SymbolsService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService, symbolsDownloader, editorService) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.symbolsDownloader = symbolsDownloader;
        this.editorService = editorService;
        this.symbolsWarningVisible = false;
        /**
         * Indicates that symbols download is in progress. It could happen that saving launch.json will trigger another missing symbols event
         * on the language server before the current download completes.
         */
        this.inProgress = false;
    }
    activate() {
        this.registerFolderCommand("al.downloadSymbols", () => this.downloadSymbols(false, true));
    }
    downloadSymbols(silent = false, force = false) {
        status_1.outputChannel.clear();
        status_1.outputChannel.show();
        this.inProgress = true;
        const params = configurationHelpers_1.getAlParams();
        params.force = force;
        return this.editorService.saveAllDocuments()
            .then(() => this.initalizeDebugAdapterService.mapToDebugConfiguration(false, false, false, initalizeDebugAdapterService_1.DebugConfigurationFilter.Launch | initalizeDebugAdapterService_1.DebugConfigurationFilter.SnapshotInitialize))
            .catch(e => {
            status_1.outputChannel.appendLine(resources_1.default.noServerChosenError);
            throw e;
        })
            .then(c => {
            if (snapshotDebugger_1.isSnapshotDebugAdapterConfiguration(c)) {
                return Promise.resolve(true);
            }
            if (snapshotDebugger_1.isSnapshotInitializeDebugConfiguration(c)) {
                // The snapshot initialize configuration protocol is different from the downloadsymbols protocol
                // We need to map it.
                let downloadConfig = this.mapSnapshotConfigurationToDownloadConfiguration(c);
                params.isForSnapshotEndpoint = true;
                return this.symbolsDownloader.downloadSymbols(downloadConfig, params);
            }
            if (!c.port) {
                c.port = constants_1.DefaultDevEndpointPort;
            }
            return this.symbolsDownloader.downloadSymbols(c, params);
        })
            .then(success => this.onDownloadComplete(success, silent))
            .catch(() => this.onDownloadComplete(false, silent));
    }
    checkSymbols() {
        return this.symbolsDownloader.checkSymbols();
    }
    activateMissingSymbolsMonitor() {
        this.symbolsDownloader.symbolsMissing.event(() => this.onSymbolsMissing());
    }
    mapSnapshotConfigurationToDownloadConfiguration(protocol) {
        var _a;
        return {
            name: protocol.name,
            request: protocol.request,
            server: protocol.configuration.server,
            authentication: protocol.configuration.authentication,
            serverInstance: protocol.configuration.serverInstance,
            port: (_a = protocol.configuration.port, (_a !== null && _a !== void 0 ? _a : constants_1.DefaultSnapshotEndpointPort)),
            tenant: protocol.configuration.tenant,
            applicationFamily: protocol.configuration.applicationFamily,
            sandboxName: protocol.configuration.sandboxName,
            disableHttpRequestTimeout: protocol.configuration.disableHttpRequestTimeout,
            deploymentId: protocol.configuration.deploymentId,
            environment: protocol.configuration.environment,
            environmentName: protocol.configuration.environmentName,
            environmentType: protocol.configuration.environmentType
        };
    }
    onDownloadComplete(success, silent) {
        this.inProgress = false;
        if (success) {
            if (!silent) {
                vscode.window.showInformationMessage(resources_1.default.symbolsDownloaded);
            }
        }
        else {
            if (!silent) {
                this.symbolsWarningVisible = true;
                vscode.window.showErrorMessage(resources_1.default.symbolsNotDownloaded, resources_1.default.tryAgainAction)
                    .then(choice => {
                    this.symbolsWarningVisible = false;
                    if (choice === resources_1.default.tryAgainAction) {
                        this.downloadSymbols(false, true);
                    }
                });
            }
            throw new Error(resources_1.default.symbolsNotDownloaded);
        }
    }
    onSymbolsMissing() {
        if (this.symbolsWarningVisible || this.inProgress) {
            return;
        }
        this.symbolsWarningVisible = true;
        vscode.window.showWarningMessage(resources_1.default.symbolsMissingWarning, resources_1.default.downloadSymbolsAction)
            .then(choice => {
            this.symbolsWarningVisible = false;
            if (choice === resources_1.default.downloadSymbolsAction) {
                this.downloadSymbols(false, true);
            }
        });
    }
}
exports.SymbolsService = SymbolsService;
//# sourceMappingURL=symbolsService.js.map