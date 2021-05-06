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
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const rc = require("./settings");
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const workspaceHelpers = require("../workspaceFolderHelpers");
/**
 * The class for handling project dependency requests
 */
class ProjectDependencyHandlerService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
        // Defines the projects that are project references and are loaded.
        this.dependentLoadedProjects = new Map();
        this.onConfigurationChangeSentOnDependentProjectEventEmitter = new vscode.EventEmitter();
        vscode.workspace.onDidSaveTextDocument(e => this.onDidSaveTextDocument(e));
        if (this.languageServerClient) {
            this.languageServerClient
                .onReady()
                .then(() => this.languageServerClient.onRequest(constants_1.AlOpenDependentProjects, (request) => __awaiter(this, void 0, void 0, function* () {
                const sourceWorkspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(request.sourceProjectFolder));
                for (const projectReference of request.projectReferences) {
                    for (const targetWorkspaceFolder of vscode.workspace.workspaceFolders) {
                        if (targetWorkspaceFolder !== sourceWorkspaceFolder) {
                            const referencedByThis = this.dependentLoadedProjects.get(targetWorkspaceFolder.uri.fsPath.toLowerCase());
                            if (!referencedByThis || !referencedByThis.has(sourceWorkspaceFolder.uri.fsPath.toLowerCase())) {
                                // We enumerate all the folders. We do not know from a project dependency definition which manifest of a workspace folder defines that.
                                // If it turns out that the targetWorkspaceFolder is a project reference then we will send back a request to the server
                                // to load project targetWorkspaceFolder and also add the project defined in targetWorkspaceFolder as a project reference to the project defined in sourceWorkspaceFolder
                                yield this.sendConfigurationChangeForDependentProject(sourceWorkspaceFolder, targetWorkspaceFolder, projectReference);
                            }
                        }
                    }
                }
            })));
        }
    }
    dispose() {
        this.onConfigurationChangeSentOnDependentProjectEventEmitter.dispose();
    }
    get onConfigurationChangeSentOnDependentProject() {
        return this.onConfigurationChangeSentOnDependentProjectEventEmitter.event;
    }
    getDependentLoadedProjects() {
        let loadedProjects = new Set();
        for (const projectReference of this.dependentLoadedProjects) {
            loadedProjects.add(projectReference[0]);
        }
        return loadedProjects;
    }
    synchronizeDependencyChanges(document, containingWorkspace) {
        return __awaiter(this, void 0, void 0, function* () {
            const dependencies = this.getDependenciesDefinition(document);
            if (dependencies === undefined || dependencies.length == 0) {
                const request = {
                    folder: containingWorkspace.uri.fsPath,
                };
                this.languageServerClient.sendRequest(constants_1.AlSynchronizeProjectDependenciesRequest, request);
                return;
            }
            yield this.getDependentWorkspaceFolders(containingWorkspace, dependencies).then(dependentProjectFolderPaths => {
                if (dependentProjectFolderPaths) {
                    const request = {
                        folder: containingWorkspace.uri.fsPath,
                        dependentProjectFolders: dependentProjectFolderPaths
                    };
                    this.languageServerClient.sendRequest(constants_1.AlSynchronizeProjectDependenciesRequest, request);
                }
            });
        });
    }
    copyOutputFileToAllWorkspaceFoldersDependingOnCurrentWorkspaceFolder(outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWorkspaceFolder = workspaceHelpers.getCurrentWorkspaceFolder();
            const currentWorkspaceFile = vscode.Uri.file(path.join(currentWorkspaceFolder.uri.fsPath, constants_1.AlProjectFileName));
            if (!fs.existsSync(currentWorkspaceFile.fsPath)) {
                return;
            }
            const doc = yield vscode.workspace.openTextDocument(currentWorkspaceFile);
            if (doc === undefined) {
                return;
            }
            const currentProjectDefinition = this.getProjectDependencyDefinition(doc);
            const workspaceFoldersNeedingSymbolRefresh = {
                appPath: outputPath,
                folders: []
            };
            for (const workspaceFolder of vscode.workspace.workspaceFolders) {
                if (workspaceFolder !== currentWorkspaceFolder) {
                    const dependencies = yield this.getDependenciesDefinitionForProject(workspaceFolder.uri.fsPath);
                    if (dependencies && dependencies.length > 0) {
                        let found = false;
                        dependencies.forEach(dep => {
                            if (dep.appId === currentProjectDefinition.appId &&
                                dep.name === currentProjectDefinition.name &&
                                dep.publisher === currentProjectDefinition.publisher &&
                                dep.version === currentProjectDefinition.version) {
                                found = true;
                                return;
                            }
                        });
                        if (found) {
                            const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId, workspaceFolder.uri);
                            let dependencyOutputFolder = alConfig.get("packageCachePath");
                            if (dependencyOutputFolder === undefined) {
                                dependencyOutputFolder = path.join(workspaceFolder.uri.fsPath, constants_1.DefaultPackageCachePath);
                            }
                            else if (!path.isAbsolute(dependencyOutputFolder)) {
                                dependencyOutputFolder = path.join(workspaceFolder.uri.fsPath, dependencyOutputFolder);
                            }
                            if (!fs.existsSync(dependencyOutputFolder)) {
                                try {
                                    fs.mkdirSync(dependencyOutputFolder);
                                }
                                catch (e) {
                                    Promise.reject(e);
                                }
                            }
                            const filename = path.basename(outputPath);
                            const dependencyOutputFileName = path.join(dependencyOutputFolder, filename);
                            yield this.copyFile(outputPath, dependencyOutputFileName).then(() => {
                                workspaceFoldersNeedingSymbolRefresh.folders.push(workspaceFolder.uri.fsPath);
                            }, (error) => Promise.reject(error));
                        }
                    }
                }
            }
            if (workspaceFoldersNeedingSymbolRefresh.folders.length > 0) {
                yield this.languageServerClient.sendRequest(constants_1.AlRefreshSymbolReferencesRequest, {
                    AppPath: workspaceFoldersNeedingSymbolRefresh.appPath,
                    Folders: workspaceFoldersNeedingSymbolRefresh.folders
                });
            }
        });
    }
    onDidSaveTextDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageServerClient) {
                return;
            }
            if (path.basename(document.fileName) !== constants_1.AlProjectFileName) {
                return;
            }
            const containingWorkspace = vscode.workspace.getWorkspaceFolder(document.uri);
            if (containingWorkspace === undefined) {
                return;
            }
            yield this.synchronizeDependencyChanges(document, containingWorkspace);
        });
    }
    getProjectReferences(workspace) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectReferences = [];
            const dependencies = yield this.getDependenciesDefinitionForProject(workspace.uri.fsPath);
            if (dependencies && dependencies.length > 0) {
                const dependenciesSet = new Set(dependencies.map(d => this.createTempKey(d)));
                for (const referenceWorkspaceFolder of vscode.workspace.workspaceFolders) {
                    if (referenceWorkspaceFolder !== workspace) {
                        const currentWorkspaceFile = vscode.Uri.file(path.join(referenceWorkspaceFolder.uri.fsPath, constants_1.AlProjectFileName));
                        if (fs.existsSync(currentWorkspaceFile.fsPath)) {
                            const doc = yield vscode.workspace.openTextDocument(currentWorkspaceFile);
                            if (doc) {
                                const projectReferenceDefinition = this.getProjectDependencyDefinition(doc);
                                if (projectReferenceDefinition && dependenciesSet.has(this.createTempKey(projectReferenceDefinition))) {
                                    const definition = {
                                        path: referenceWorkspaceFolder.uri.fsPath,
                                        projectDependencyDefinition: projectReferenceDefinition
                                    };
                                    projectReferences.push(definition);
                                }
                            }
                        }
                    }
                }
            }
            return projectReferences;
        });
    }
    getDependentWorkspaceFolders(containingWorkspace, dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            const dependentFolders = [];
            for (const dep of dependencies) {
                for (const f of vscode.workspace.workspaceFolders) {
                    if (f !== containingWorkspace) {
                        const isProjectReference = yield this.isProjectReference(f, dep);
                        if (isProjectReference) {
                            dependentFolders.push(f.uri.fsPath);
                            if (!this.dependentLoadedProjects.has(f.uri.fsPath.toLowerCase())) {
                                yield this.sendConfigurationChangeForDependentProject(containingWorkspace, f, dep);
                            }
                            break;
                        }
                    }
                }
            }
            return dependentFolders;
        });
    }
    sendConfigurationChange(projectReferenceFolder, setaActiveWorkspace, sourceProjectFolder) {
        const workspaceSettings = rc.getWorkspaceSettings(projectReferenceFolder, setaActiveWorkspace, sourceProjectFolder);
        this.languageServerClient.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: workspaceSettings });
    }
    sendConfigurationChangeForDependentProject(sourceProjectFolder, projectReferenceFolder, alProjectDependencyDefinition) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.isProjectReference(projectReferenceFolder, alProjectDependencyDefinition).then(success => {
                if (success) {
                    this.sendConfigurationChange(projectReferenceFolder.uri.fsPath, false, sourceProjectFolder.uri.fsPath);
                    const path = projectReferenceFolder.uri.fsPath.toLowerCase();
                    let projectsDependingOnThis = undefined;
                    if (!this.dependentLoadedProjects.has(path)) {
                        projectsDependingOnThis = new Set();
                    }
                    else {
                        projectsDependingOnThis = this.dependentLoadedProjects.get(path);
                    }
                    projectsDependingOnThis.add(sourceProjectFolder.uri.fsPath.toLowerCase());
                    this.dependentLoadedProjects.set(path, projectsDependingOnThis);
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }).then(result => {
                if (result) {
                    this.onConfigurationChangeSentOnDependentProjectEventEmitter.fire(projectReferenceFolder.uri.fsPath);
                }
                return result;
            });
            ;
        });
    }
    isProjectReference(workspaceFolder, alProjectDependencyDefinition) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceUri = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, constants_1.AlProjectFileName));
            if (fs.existsSync(workspaceUri.fsPath)) {
                const doc = yield vscode.workspace.openTextDocument(workspaceUri);
                if (doc === undefined) {
                    return false;
                }
                const manifestDependencyDefinition = this.getProjectDependencyDefinition(doc);
                if (manifestDependencyDefinition) {
                    // We will consider a project reference that has a matching id, name and publisher.
                    // We ignore the version, since we should not require exact match in a dependency with the
                    // project.
                    if (manifestDependencyDefinition.appId === alProjectDependencyDefinition.appId &&
                        manifestDependencyDefinition.name === alProjectDependencyDefinition.name &&
                        manifestDependencyDefinition.publisher === alProjectDependencyDefinition.publisher) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    getDependenciesDefinition(projectFile) {
        const contentText = projectFile.getText();
        // We also leave it all as dynamic for now.
        let dependencies = [];
        const manifestObject = JSON.parse(contentText);
        if (manifestObject) {
            const dependenciesAsArray = manifestObject.dependencies;
            if (dependenciesAsArray) {
                dependenciesAsArray.forEach(element => {
                    let appId;
                    // Validation for missing or not the correct type is done in the language server.
                    if (element.id) {
                        appId = element.id;
                    }
                    else {
                        appId = element.appId;
                    }
                    const dependency = {
                        appId: appId,
                        name: element.name,
                        publisher: element.publisher,
                        version: element.version,
                    };
                    dependencies.push(dependency);
                });
            }
        }
        return dependencies;
    }
    getProjectDependencyDefinition(document) {
        const contentText = document.getText();
        // We leave it as dynamic for now.
        const manifestObject = JSON.parse(contentText);
        if (manifestObject) {
            return {
                appId: manifestObject.id,
                name: manifestObject.name,
                publisher: manifestObject.publisher,
                version: manifestObject.version
            };
        }
    }
    getDependenciesDefinitionForProject(projectFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceUri = vscode.Uri.file(path.join(projectFolder, constants_1.AlProjectFileName));
            if (fs.existsSync(workspaceUri.fsPath)) {
                const doc = yield vscode.workspace.openTextDocument(workspaceUri);
                if (doc === undefined) {
                    return undefined;
                }
                return this.getDependenciesDefinition(doc);
            }
        });
    }
    copyFile(source, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                const reader = fs.createReadStream(source).on('error', (err) => reject(err));
                const ws = fs.createWriteStream(dest).on('error', (err) => {
                    return reject(err);
                }).on('close', () => {
                    return resolve();
                });
                reader.pipe(ws);
            });
        });
    }
    createTempKey(dep) {
        return ("" + dep.appId + dep.name + dep.publisher + dep.version).toLowerCase();
    }
}
exports.ProjectDependencyHandlerService = ProjectDependencyHandlerService;
//# sourceMappingURL=projectDependencyHandlerservice.js.map