"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const rc = require("./settings");
/**
 * The class for handling configuration requests.
 */
class ConfigurationService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
        if (this.languageServerClient) {
            this.languageServerClient
                .onReady()
                .then(() => this.languageServerClient.onRequest(constants_1.WorkspaceConfiguration, (request) => {
                for (const item of request.items) {
                    const workspaceSettings = rc.getWorkspaceSettings(item.scopeUri);
                    languageServerClient.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: workspaceSettings });
                }
            }));
        }
    }
}
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=configurationService.js.map