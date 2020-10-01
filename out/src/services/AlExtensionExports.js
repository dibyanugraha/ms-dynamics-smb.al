"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class AlExtensionExports {
    constructor(languageServerClient, services) {
        this.languageServerClient = languageServerClient;
        this.services = services;
    }
    onReady() {
        return this.languageServerClient.onReady();
    }
    getServices() {
        return this.services;
    }
}
exports.AlExtensionExports = AlExtensionExports;
//# sourceMappingURL=AlExtensionExports.js.map