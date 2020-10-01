"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const path = require("path");
const vscode = require("vscode");
const workspaceHelpers = require("../workspaceFolderHelpers");
const clipboard_1 = require("../clipboard");
const constants_1 = require("../constants");
const fsHelpers_1 = require("../fsHelpers");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const vscodeHelpers_1 = require("../vscodeHelpers");
const extensionService_1 = require("./extensionService");
/**
 * The class for generating artifacts such as app.json and other content files.
 */
class ContentService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
        if (this.languageServerClient) {
            this.languageServerClient.onReady()
                .then(() => this.languageServerClient.onNotification(constants_1.AlManifestMissingEvent, () => this.onManifestMissingEvent()))
                .then(() => this.languageServerClient.onNotification(constants_1.AlDeviceLoginEvent, object => this.onDeviceLoginEvent(object)));
        }
    }
    activate() {
        const disposable = vscode.commands.registerCommand("al.generateManifest", () => this.generateAppJson(workspaceHelpers.getCurrentWorkspaceFolderPath(), "6.0", true));
        this.registerForDisposal(disposable);
    }
    generateAppJson(rootPath, targetPlatform, show = false) {
        if (!rootPath) {
            return Promise.reject(resources_2.default.noActiveWorkspaceFolder);
        }
        const appJson = path.join(rootPath, constants_1.AlProjectFileName);
        const projectName = path.basename(rootPath);
        let result = fsHelpers_1.existsFileAsync(appJson)
            .then(exists => {
            if (exists) {
                return appJson;
            }
            return fsHelpers_1.writeTextFileAsync(appJson, JSON.stringify(ContentService.buildAppJson(projectName, targetPlatform), null, "  "))
                .then(() => appJson);
        });
        if (show) {
            result = result.then(resultAppJson => vscodeHelpers_1.openTextDocument(resultAppJson));
        }
        return result;
    }
    static buildAppJson(projectName, targetPlatform) {
        const json = {
            "id": uuid.v4(),
            "name": projectName,
            "publisher": "Default publisher",
            "version": "1.0.0.0",
            "brief": "",
            "description": "",
            "privacyStatement": "",
            "EULA": "",
            "help": "",
            "url": "",
            "logo": "",
            "dependencies": ContentService.generateDependencies(targetPlatform),
            "screenshots": [],
            "platform": ContentService.getPlatformVersion(targetPlatform),
            "application": ContentService.getApplicationVersion(targetPlatform),
            "idRanges": [
                {
                    "from": 50100,
                    "to": 50149
                }
            ],
            "contextSensitiveHelpUrl": `https://${projectName.trim().replace(/\s/g, "")}.com/help/`,
            "showMyCode": true,
            "runtime": `${targetPlatform}`
        };
        for (const propToRemove of ContentService.getInvalidProperties(targetPlatform)) {
            delete json[propToRemove];
        }
        return json;
    }
    static generateDependencies(targetPlatform) {
        switch (targetPlatform) {
            case "6.0":
                return [];
            case "5.0":
                return [
                    {
                        "id": "63ca2fa4-4f03-4f2b-a480-172fef340d3f",
                        "publisher": "Microsoft",
                        "name": "System Application",
                        "version": "16.0.0.0"
                    },
                    {
                        "id": "437dbf0e-84ff-417a-965d-ed2bb9650972",
                        "publisher": "Microsoft",
                        "name": "Base Application",
                        "version": "16.0.0.0"
                    }
                ];
            case "4.0":
                return [
                    {
                        "appId": "63ca2fa4-4f03-4f2b-a480-172fef340d3f",
                        "publisher": "Microsoft",
                        "name": "System Application",
                        "version": "1.0.0.0"
                    },
                    {
                        "appId": "437dbf0e-84ff-417a-965d-ed2bb9650972",
                        "publisher": "Microsoft",
                        "name": "Base Application",
                        "version": "15.0.0.0"
                    }
                ];
            case "3.0":
            case "2.0":
            case "1.0":
                return [];
            default:
                throw new Error(`Unknown version ${targetPlatform}`);
        }
    }
    static getPlatformVersion(targetPlatform) {
        switch (targetPlatform) {
            case "6.0": return "17.0.0.0";
            case "5.0": return "16.0.0.0";
            case "4.0": return "15.0.0.0";
            case "3.0": return "14.0.0.0";
            case "2.0": return "13.0.0.0";
            case "1.0": return "12.0.0.0";
            default:
                throw new Error(`Unknown version ${targetPlatform}`);
        }
    }
    static getApplicationVersion(targetPlatform) {
        switch (targetPlatform) {
            case "6.0": return "17.0.0.0";
            case "5.0": return null;
            case "4.0": return null;
            case "3.0": return "14.0.0.0";
            case "2.0": return "13.0.0.0";
            case "1.0": return "12.0.0.0";
            default:
                throw new Error(`Unknown version ${targetPlatform}`);
        }
    }
    static getInvalidProperties(targetPlatform) {
        switch (targetPlatform) {
            case "6.0":
                return [];
            case "5.0":
            case "4.0":
                return ["application"];
            case "3.0":
                return [];
            case "2.0":
            case "1.0":
                return ["idRanges", "contextSensitiveHelpUrl"];
            default:
                throw new Error(`Unknown version ${targetPlatform}`);
        }
    }
    generateDefaultAlFile(rootPath) {
        // samples could be downloaded from our github here
        const filePath = path.join(rootPath, constants_1.DefaultAlFileName);
        return fsHelpers_1.existsFileAsync(filePath)
            .then(exists => {
            if (exists) {
                return filePath;
            }
            const contents = `// Welcome to your new AL extension.
// Remember that object names and IDs should be unique across all extensions.
// AL snippets start with t*, like tpageext - give them a try and happy coding!

pageextension 50100 CustomerListExt extends "Customer List"
{
    trigger OnOpenPage();
    begin
        Message('App published: Hello world');
    end;
}`;
            return fsHelpers_1.writeTextFileAsync(filePath, contents)
                .then(() => filePath);
        });
    }
    onManifestMissingEvent() {
        vscode.window.showWarningMessage(resources_1.default.manifestMissingWarning, resources_1.default.generateManifestAction)
            .then(choice => {
            if (choice === resources_1.default.generateManifestAction) {
                this.generateAppJson(workspaceHelpers.getCurrentWorkspaceFolderPath(), "6.0", true);
            }
        });
    }
    onDeviceLoginEvent(message) {
        vscode.window.showInformationMessage(message.message, resources_1.default.copyAndOpen)
            .then(choice => {
            if (choice === resources_1.default.copyAndOpen) {
                clipboard_1.copyTextToClipboard(message.token);
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(message.uri));
            }
        });
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=contentService.js.map