"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const resources_1 = require("../resources");
const status_1 = require("../status");
const vscodeHelpers_1 = require("../vscodeHelpers");
/**
 * The class for obtaining the user credentials for UserPassword authentication and storing them in the language server.
 */
class UserPasswordAuth {
    constructor(languageServerClient) {
        this.languageServerClient = languageServerClient;
    }
    /**
     * Obtains the user credentials and sends them to the language server.
     */
    authenticate(configuration) {
        const credentials = { username: "", password: "" };
        return this.getUsername(credentials)
            .then(() => this.getPassword(credentials))
            .then(() => this.saveCredentials(configuration, credentials))
            .catch(e => {
            status_1.outputChannel.appendLine(resources_1.default.authenticationCancelled);
            throw e;
        });
    }
    getUsername(credentials) {
        return vscodeHelpers_1.showInputBox({ prompt: resources_1.default.serverAuthPrompt, placeHolder: resources_1.default.usernamePlaceholder }, true)
            .then(username => {
            credentials.username = username;
        });
    }
    getPassword(credentials) {
        return vscodeHelpers_1.showInputBox({ prompt: resources_1.default.serverAuthPrompt, placeHolder: resources_1.default.passwordPlaceholder, password: true }, true)
            .then(password => {
            credentials.password = password;
        });
    }
    saveCredentials(configuration, credentials) {
        return this.languageServerClient.sendRequest(constants_1.AlSaveUsernamePasswordRequest, { configuration, credentials });
    }
}
exports.UserPasswordAuth = UserPasswordAuth;
//# sourceMappingURL=userPasswordAuth.js.map