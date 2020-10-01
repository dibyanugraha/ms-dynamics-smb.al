"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const serverProxy_1 = require("./serverProxy");
class OpenPageDesignerService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService, languageServerClient, buildService) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.buildService = buildService;
        this.serverProxy = new serverProxy_1.ServerProxy(languageServerClient);
    }
    activate() {
        this.registerFolderCommand("al.openPageDesigner", () => this.openPageDesigner());
    }
    openPageDesigner() {
        return this.initalizeDebugAdapterService.getDebugAdapterConfiguration().then(c => this.sendOpenPageDesignerRequest(c));
    }
    sendOpenPageDesignerRequest(launchConfig) {
        const params = configurationHelpers_1.getAlParams();
        this.buildService.packageContainer()
            .then(() => this.serverProxy.sendRequest(launchConfig, constants_1.AlOpenPageDesignerRequest, params));
    }
}
exports.OpenPageDesignerService = OpenPageDesignerService;
//# sourceMappingURL=openPageDesignerService.js.map