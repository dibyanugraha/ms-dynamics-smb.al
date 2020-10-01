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
 * The service responsible for generating permission set for the current extension.
 */
class PermissionSetService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
    }
    activate() {
        this.registerFolderCommand("al.generatePermissionSetForExtensionObjects", () => this.generatePermissionSet());
    }
    generate() {
        const currentWorkspaceFolderPath = workspaceFolderHelpers_1.getCurrentWorkspaceFolderPath();
        if (!currentWorkspaceFolderPath) {
            return;
        }
        const params = { currentWorkspacePath: currentWorkspaceFolderPath };
        return this.languageServerClient.sendRequest(constants_1.AlGeneratePermissionSetRequest, params);
    }
    generatePermissionSet() {
        return this.generate().then(response => this.onGenerateComplete(response.success));
    }
    onGenerateComplete(success) {
        if (success) {
            vscode.window.showInformationMessage(resources_1.default.permissionSetSuccessfullyGenerated);
        }
        else {
            vscode.window.showErrorMessage(resources_1.default.permissionSetNotGenerated, resources_1.default.tryAgainAction)
                .then(choice => {
                if (choice === resources_1.default.tryAgainAction) {
                    this.generatePermissionSet();
                }
            });
            throw new Error(resources_1.default.permissionSetNotGenerated);
        }
    }
}
exports.PermissionSetService = PermissionSetService;
//# sourceMappingURL=permissionSetService.js.map