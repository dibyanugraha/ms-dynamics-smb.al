"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const configurationHelpers_1 = require("../configurationHelpers");
class PublishingService extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
    }
    activate() {
        this.registerFolderCommand("al.publishExistingExtension", () => this.publishApplication());
    }
    publishApplication() {
        var _a, _b;
        if (vscode.debug.activeDebugSession) {
            const configuration = vscode.debug.activeDebugSession.configuration;
            const alParams = configurationHelpers_1.getAlParams();
            let params = {
                applicationFamily: configuration.applicationFamily,
                authentication: configuration.authentication,
                deploymentId: configuration.deploymentId,
                port: configuration.port,
                sandboxName: configuration.sandboxName,
                schemaUpdateMode: configuration.schemaUpdateMode,
                server: configuration.server,
                serverInstance: configuration.serverInstance,
                tenant: configuration.tenant,
                forceUpgrade: (_a = configuration.forceUpgrade, (_a !== null && _a !== void 0 ? _a : false)),
                disableInstallDebugging: (_b = configuration.useSystemSessionForDeployment, (_b !== null && _b !== void 0 ? _b : false)),
                environment: alParams.environmentInfo.env,
                environmentType: configuration.environmentType,
                environmentName: configuration.environmentName
            };
            return vscode.debug.activeDebugSession.customRequest(constants_1.AlPublish, params);
        }
    }
}
exports.PublishingService = PublishingService;
//# sourceMappingURL=publishingService.js.map