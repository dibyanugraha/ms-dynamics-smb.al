"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class LanguageClientImpl {
    constructor(languageClient) {
        this.languageClient = languageClient;
        this.outputChannel = this.languageClient.outputChannel;
    }
    sendRequest(method, param) {
        return this.languageClient.sendRequest(method, param);
    }
    onNotification(method, handler) {
        this.languageClient.onNotification(method, handler);
    }
    onReady() {
        return this.languageClient.onReady();
    }
    asTextDocumentPositionParams(textDocument, position) {
        return this.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(textDocument, position);
    }
    onRequest(method, handler) {
        return this.languageClient.onRequest(method, handler);
    }
    sendNotification(type, params) {
        return this.languageClient.sendNotification(type, params);
    }
}
exports.LanguageClientImpl = LanguageClientImpl;
//# sourceMappingURL=languageClientImpl.js.map