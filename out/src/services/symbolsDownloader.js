"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const serverProxy_1 = require("./serverProxy");
/**
 * The class which encapsulates the internals of downloading symbols from the server.
 * Currently it is implemented using a language server extension.
 */
class SymbolsDownloader {
    constructor(languageServerClient) {
        this.languageServerClient = languageServerClient;
        this.symbolsMissing = new vscode.EventEmitter();
        this.serverProxy = new serverProxy_1.ServerProxy(languageServerClient);
        if (this.languageServerClient) {
            this.languageServerClient.onReady()
                .then(() => this.languageServerClient.onNotification(constants_1.AlSymbolsMissingEvent, () => this.symbolsMissing.fire()));
        }
    }
    downloadSymbols(config, params) {
        return this.serverProxy.sendRequest(config, constants_1.AlDownloadSymbolsRequest, params)
            .then((data) => data.success);
    }
    checkSymbols() {
        return new Promise((resolve, reject) => {
            this.languageServerClient.sendRequest(constants_1.AlCheckSymbolsRequest)
                .then((data) => resolve(data.success), reject);
        });
    }
}
exports.SymbolsDownloader = SymbolsDownloader;
//# sourceMappingURL=symbolsDownloader.js.map