"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const configurationHelpers_1 = require("../configurationHelpers");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const serverProxy_1 = require("./serverProxy");
class OpenEventRecorderService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService, languageServerClient) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.languageServerClient = languageServerClient;
        this.serverProxy = new serverProxy_1.ServerProxy(languageServerClient);
    }
    activate() {
        this.registerFolderCommand("al.openEventRecorder", () => this.openEventRecorder());
    }
    openEventRecorder() {
        return this.initalizeDebugAdapterService.getDebugAdapterConfiguration().then(c => this.sendOpenEventRecorderRequest(c));
    }
    sendOpenEventRecorderRequest(configuration) {
        const params = configurationHelpers_1.getAlParams();
        this.serverProxy.sendRequest(configuration, constants_1.AlOpenEventRecorderRequest, params);
    }
}
exports.OpenEventRecorderService = OpenEventRecorderService;
//# sourceMappingURL=openEventRecorderService.js.map