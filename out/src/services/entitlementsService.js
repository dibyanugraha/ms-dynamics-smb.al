"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const resources_1 = require("../resources");
const workspaceFolderHelpers_1 = require("../workspaceFolderHelpers");
const extensionService_1 = require("./extensionService");
/**
 * The service responsible for generating entitlements for the current extension.
 */
class EntitlementsService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
    }
    activate() {
        this.registerFolderCommand("al.generateEntitlementsForExtensionObjects", () => this.generateEntitlements());
    }
    generate() {
        const currentWorkspaceFolderPath = workspaceFolderHelpers_1.getCurrentWorkspaceFolderPath();
        if (!currentWorkspaceFolderPath) {
            return;
        }
        const params = { currentWorkspacePath: currentWorkspaceFolderPath };
        return this.languageServerClient.sendRequest(constants_1.AlGenerateEntitlementsRequest, params);
    }
    generateEntitlements() {
        return this.generate().then(response => this.onGenerateComplete(response.success));
    }
    onGenerateComplete(success) {
        if (success) {
            vscode.window.showInformationMessage(resources_1.default.entitlementsSuccessfullyGenerated);
        }
        else {
            vscode.window.showErrorMessage(resources_1.default.entitlementsNotGenerated, resources_1.default.tryAgainAction)
                .then(choice => {
                if (choice === resources_1.default.tryAgainAction) {
                    this.generateEntitlements();
                }
            });
            throw new Error(resources_1.default.entitlementsNotGenerated);
        }
    }
}
exports.EntitlementsService = EntitlementsService;
//# sourceMappingURL=entitlementsService.js.map