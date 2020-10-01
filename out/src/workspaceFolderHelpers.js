"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("./constants");
function getWorkspacePath(path) {
    const uri = vscode.Uri.file(path);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        return vscode.workspace.workspaceFolders.length > 0 ? undefined : vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return workspaceFolder.uri.fsPath;
}
exports.getWorkspacePath = getWorkspacePath;
function getCurrentWorkspaceFolderPath() {
    const currentWorkspaceFolder = getCurrentWorkspaceFolder();
    if (currentWorkspaceFolder) {
        return currentWorkspaceFolder.uri.fsPath;
    }
    return undefined;
}
exports.getCurrentWorkspaceFolderPath = getCurrentWorkspaceFolderPath;
function getCurrentWorkspaceFolder() {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        lastActiveWorkspace = undefined;
        return lastActiveWorkspace;
    }
    // one workspace folder, this is the old folder/rootpath scenario.
    if (vscode.workspace.workspaceFolders.length === 1) {
        lastActiveWorkspace = vscode.workspace.workspaceFolders[0];
        return lastActiveWorkspace;
    }
    // in VsCode there is no notion of active project.
    // we have therefore to recurse to some logic to find which is the "active workspace"
    // for this
    // 1. We try the active text editor
    // 2. We try the visible text editor which has an 'al' file, a 'json' file or any text file that exists.
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        if (activeEditor.document && isPossibleProjectFile(activeEditor.document)) {
            lastActiveWorkspace = getWorkspaceFolderFromPath(activeEditor.document.fileName);
            return lastActiveWorkspace;
        }
    }
    const visibleTextEditors = vscode.window.visibleTextEditors;
    if (visibleTextEditors && visibleTextEditors.length > 0) {
        // try to restore the last active workspace
        if (lastActiveWorkspace) {
            for (const e of visibleTextEditors) {
                const uri = vscode.Uri.file(e.document.fileName);
                const workspace = vscode.workspace.getWorkspaceFolder(uri);
                if (lastActiveWorkspace === workspace) {
                    return lastActiveWorkspace;
                }
            }
        }
        // otherwise just pick the first one containing project document
        for (const e of visibleTextEditors) {
            if (isPossibleProjectFile(e.document)) {
                lastActiveWorkspace = getWorkspaceFolderFromPath(e.document.fileName);
                return lastActiveWorkspace;
            }
        }
    }
    lastActiveWorkspace = undefined;
    return lastActiveWorkspace;
}
exports.getCurrentWorkspaceFolder = getCurrentWorkspaceFolder;
function isPossibleProjectFile(document) {
    return (document.languageId === constants_1.AlLanguageId || document.languageId === "json" ||
        document.uri.scheme === "file") && fs.existsSync(document.fileName);
}
exports.isPossibleProjectFile = isPossibleProjectFile;
function isActiveWorkspacePossibleAlWorkspace() {
    const workspaceRoot = getCurrentWorkspaceFolderPath();
    if (!workspaceRoot) {
        return false;
    }
    return isWorkspacePathPossibleAlWorkspace(workspaceRoot);
}
exports.isActiveWorkspacePossibleAlWorkspace = isActiveWorkspacePossibleAlWorkspace;
function isWorkspacePathPossibleAlWorkspace(workspacePath) {
    if (!workspacePath) {
        return false;
    }
    const appJson = path.join(workspacePath, constants_1.AlProjectFileName);
    return fs.existsSync(appJson);
}
exports.isWorkspacePathPossibleAlWorkspace = isWorkspacePathPossibleAlWorkspace;
function isWorkspacePossibleAlWorkspace(workspace) {
    if (!workspace) {
        return false;
    }
    const appJson = path.join(workspace.uri.fsPath, constants_1.AlProjectFileName);
    return fs.existsSync(appJson);
}
exports.isWorkspacePossibleAlWorkspace = isWorkspacePossibleAlWorkspace;
function getWorkspaceFolderFromPath(path) {
    const uri = vscode.Uri.file(path);
    const workspace = vscode.workspace.getWorkspaceFolder(uri);
    if (isWorkspacePossibleAlWorkspace(workspace)) {
        return workspace;
    }
    return undefined;
}
exports.getWorkspaceFolderFromPath = getWorkspaceFolderFromPath;
function getWorkspaceFolderFromName(name) {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        return undefined;
    }
    const loweredName = name.toLowerCase();
    const projects = vscode.workspace.workspaceFolders;
    for (const project of projects) {
        if (loweredName === project.name.toLowerCase()) {
            return project;
        }
    }
    return undefined;
}
exports.getWorkspaceFolderFromName = getWorkspaceFolderFromName;
let lastActiveWorkspace = undefined;
//# sourceMappingURL=workspaceFolderHelpers.js.map