"use strict";
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
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("./constants");
const workspaceFolderHelpers_1 = require("./workspaceFolderHelpers");
const fs_1 = require("fs");
function getProjectRuntimeVersion(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = yield getManifest(document);
        if (!manifest) {
            return Promise.resolve(constants_1.ReferenceApplicationFileBasedGotoDefinitionMinVersion);
        }
        let versionNumber = constants_1.ReferenceApplicationFileBasedGotoDefinitionMinVersion;
        if (manifest.runtime) {
            versionNumber = +manifest.runtime;
        }
        return Promise.resolve(versionNumber);
    });
}
exports.getProjectRuntimeVersion = getProjectRuntimeVersion;
function getManifest(document) {
    return __awaiter(this, void 0, void 0, function* () {
        let folderName = tryGetWorkspaceFolderPathFromPreviewFile(document);
        if (!folderName) {
            folderName = workspaceFolderHelpers_1.getWorkspacePath(document.fsPath);
        }
        if (!folderName) {
            return undefined;
        }
        const workspaceUri = vscode.Uri.file(path.join(folderName, constants_1.AlProjectFileName));
        if (!fs_1.existsSync(workspaceUri.fsPath)) {
            return undefined;
        }
        const doc = yield vscode.workspace.openTextDocument(workspaceUri);
        if (doc === undefined) {
            return undefined;
        }
        const contentText = doc.getText();
        const manifestObject = JSON.parse(contentText);
        return Promise.resolve(manifestObject);
    });
}
exports.getManifest = getManifest;
function tryGetWorkspaceFolderPathFromPreviewFile(document) {
    if (document.scheme !== constants_1.AlPreviewSchema) {
        return undefined;
    }
    const pathParts = document.path.split('/');
    // a path part always starts with a /
    const folderName = pathParts && pathParts.length > 1 ? pathParts[1] : undefined;
    if (!folderName) {
        return undefined;
    }
    let w = workspaceFolderHelpers_1.getWorkspaceFolderFromName(folderName);
    if (!w) {
        return undefined;
    }
    return w.uri.fsPath;
}
//# sourceMappingURL=manifestHelpers.js.map