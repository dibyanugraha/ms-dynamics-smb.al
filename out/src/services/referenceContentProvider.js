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
const vscode = require("vscode");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
var ReferenceSourceKind;
(function (ReferenceSourceKind) {
    ReferenceSourceKind[ReferenceSourceKind["Undefined"] = 0] = "Undefined";
    ReferenceSourceKind[ReferenceSourceKind["Source"] = 1] = "Source";
    ReferenceSourceKind[ReferenceSourceKind["Metadata"] = 2] = "Metadata";
    ReferenceSourceKind[ReferenceSourceKind["CALSource"] = 3] = "CALSource";
})(ReferenceSourceKind || (ReferenceSourceKind = {}));
class ReferenceContentProvider extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
    }
    activate() {
        this.registerForDisposal(vscode.workspace.registerTextDocumentContentProvider(constants_1.AlPreviewSchema, this));
    }
    provideTextDocumentContent(uri, token) {
        const request = { Uri: uri.toString() };
        // Try the language server first to possibly locate the reference path from symbol references.
        // If we are debugging and we got nothing or metadata only, recourse to the server to download the DAL preview source
        return this.languageServerClient.sendRequest(constants_1.AlOpenPreviewDocument, request).then((result) => __awaiter(this, void 0, void 0, function* () {
            if (result.kind !== ReferenceSourceKind.Source && result.kind !== ReferenceSourceKind.CALSource && vscode.debug.activeDebugSession) {
                const debugPreviewResult = yield vscode.debug.activeDebugSession.customRequest(constants_1.AlOpenPreviewDocument, request);
                return Promise.resolve(debugPreviewResult.content);
            }
            return Promise.resolve(result.content);
        }));
    }
}
exports.ReferenceContentProvider = ReferenceContentProvider;
//# sourceMappingURL=referenceContentProvider.js.map