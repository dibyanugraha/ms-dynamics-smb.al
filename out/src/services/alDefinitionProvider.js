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
const serverProxy_1 = require("./serverProxy");
const configurationHelpers_1 = require("../configurationHelpers");
const manifestHelpers_1 = require("../manifestHelpers");
class AlDefinitionProvider extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient, initalizeDebugAdapterService) {
        super(context);
        this.languageServerClient = languageServerClient;
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.serverProxy = new serverProxy_1.ServerProxy(this.languageServerClient);
    }
    activate() {
        this.registerForDisposal(vscode.languages.registerDefinitionProvider(constants_1.AlLanguageId, this));
    }
    provideDefinition(textDocument, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Configurations are only needed to resolve a reference source with a server download
            // This is only needed for old <= 4.0 based solutions that have relied on C/SIDE based DAL download source content.
            // And here we return to the old paradigm. More the one definition would do lookup in the referenced symbol file
            // and if that is not found then a metadata reference source will be shown.
            let chosenConfiguration = null;
            const version = yield manifestHelpers_1.getProjectRuntimeVersion(textDocument.uri);
            if (version < constants_1.ReferenceApplicationFileBasedGotoDefinitionMinVersion) {
                const configurations = this.initalizeDebugAdapterService.getConfigurations();
                if (configurations.length === 1) {
                    chosenConfiguration = configurations[0];
                }
            }
            const params = configurationHelpers_1.getAlParams();
            params.textDocumentPositionParams = this.languageServerClient.asTextDocumentPositionParams(textDocument, position);
            return this.serverProxy.sendRequest(chosenConfiguration, constants_1.AlGotoDefinitionRequest, params).then((resultParam) => {
                if (resultParam) {
                    const uri = vscode.Uri.parse(resultParam.uri);
                    const start = new vscode.Position(resultParam.range.start.line, resultParam.range.start.character);
                    const end = new vscode.Position(resultParam.range.end.line, resultParam.range.end.character);
                    return new vscode.Location(uri, new vscode.Range(start, end));
                }
            });
        });
    }
}
exports.AlDefinitionProvider = AlDefinitionProvider;
//# sourceMappingURL=alDefinitionProvider.js.map