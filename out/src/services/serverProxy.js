"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const userPasswordAuth_1 = require("./userPasswordAuth");
/**
 * The class for communicating with the web server via the language server.
 * The proxy handles the UserPassword authentication scenarios by examining error messages and repeating the requests with the new credentials.
 */
class ServerProxy {
    constructor(languageServerClient) {
        this.languageServerClient = languageServerClient;
        this.userPasswordAuth = new userPasswordAuth_1.UserPasswordAuth(languageServerClient);
    }
    /**
     * Ensures that the user is authenticated, which means that:
     * - Either AAD/Windows authentication is used.
     * - UserPassword authentication is used and the user has entered the credentials.
     * @param configuration The launch configuration.
     */
    ensureAuthenticated(configuration, params) {
        if (configuration.authentication === "Windows") {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this.sendRequest(configuration, constants_1.AlCheckAuthenticatedRequest, params)
                .then(result => {
                if (result.authenticated) {
                    resolve();
                }
                else {
                    this.userPasswordAuth.authenticate(configuration).then(resolve, reject);
                }
            }, reject);
        });
    }
    /**
     * Sends the request and handles the authentication scenarios by re-sending the requests with the new credentials if necessary.
     *
     * @param configuration The launch configuration.
     * @param request The request method.
     * @param args The request parameters.
     */
    sendRequest(configuration, request, args) {
        const params = Object.assign({ configuration }, args);
        return new Promise((resolve, reject) => {
            this.sendRequestInternal(configuration, request, params, resolve, reject);
        });
    }
    sendServerConnectionRequest(configuration, debugConfiguration, request) {
        return new Promise((resolve, reject) => {
            this.sendRequestInternal(configuration, request, debugConfiguration, resolve, reject);
        });
    }
    sendRequestInternal(configuration, request, params, resolve, reject) {
        return this.languageServerClient.sendRequest(request, params)
            .then(resolve, e => this.onError(e, configuration, request, params, resolve, reject));
    }
    onError(error, configuration, request, params, resolve, reject) {
        if (!error) {
            reject('No error provided');
            return;
        }
        if (error.data === ServerErrorCode.Unauthorized) {
            if (configuration.authentication === "Windows") {
                reject(error);
                return;
            }
            this.userPasswordAuth.authenticate(configuration)
                .then(() => this.sendRequestInternal(configuration, request, params, resolve, reject));
            return;
        }
        reject(error);
    }
}
exports.ServerProxy = ServerProxy;
var ServerErrorCode;
(function (ServerErrorCode) {
    ServerErrorCode[ServerErrorCode["Unauthorized"] = 401] = "Unauthorized";
})(ServerErrorCode || (ServerErrorCode = {}));
//# sourceMappingURL=serverProxy.js.map