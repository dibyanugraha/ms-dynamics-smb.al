"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const workspaceHelpers = require("../workspaceFolderHelpers");
const constants_1 = require("../constants");
const fsHelpers_1 = require("../fsHelpers");
const osHelpers_1 = require("../osHelpers");
const resources_1 = require("../resources");
const resources_2 = require("../resources");
const vscodeHelpers_1 = require("../vscodeHelpers");
const extensionService_1 = require("./extensionService");
/**
 * The service responsible for the startup flow of the extension and its variations.
 */
class BootstrapService extends extensionService_1.ExtensionService {
    constructor(context, initalizeDebugAdapterService, symbolsService, contentService) {
        super(context);
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
        this.symbolsService = symbolsService;
        this.contentService = contentService;
    }
    activate() {
        const disposable = vscode.commands.registerCommand("al.go", () => this.initializeNewFolderAndRestart());
        this.registerForDisposal(disposable);
        if (vscode.workspace.workspaceFolders) {
            let initialized = Promise.resolve();
            if (this.context.globalState.get(constants_1.GoStateKey)) {
                this.context.globalState.update(constants_1.GoStateKey, false);
                initialized = this.initializeCurrentFolder();
            }
            initialized.then(() => this.symbolsService.activateMissingSymbolsMonitor())
                .then(() => vscode.commands.executeCommand("workbench.actions.view.problems"));
        }
        else if (vscode.window.activeTextEditor
            && vscode.window.activeTextEditor.document
            && vscode.window.activeTextEditor.document.languageId === constants_1.AlLanguageId) {
            // if extension is activated by opening the file, show the warning
            // otherwise, extension can be activated to initialize a new folder
            this.showNoRootPathWarning();
        }
    }
    initializeNewFolderAndRestart() {
        const initialPath = path.join(osHelpers_1.getMyProjectsDir(), constants_1.InitialProjectName);
        fsHelpers_1.findNextNonExistingDirAsync(initialPath)
            .then(dir => this.chooseRootPath(dir))
            .then(dir => this.chooseTargetPlatform(dir))
            .then(result => {
            const [dir, target] = result;
            const appJsonCreated = this.contentService.generateAppJson(dir, target);
            const filesAdded = this.contentService.generateDefaultAlFile(dir);
            return Promise.all([appJsonCreated, filesAdded]).then(() => dir);
        })
            .then(dir => {
            this.context.globalState.update(constants_1.GoStateKey, true);
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(dir));
        })
            .catch(() => {
            // ignored
        });
    }
    chooseTargetPlatform(dir) {
        const options = ({
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: resources_1.default.targetPlatformPlaceholder
        });
        const createItem = (label, description, picked = false) => {
            return {
                "label": label,
                "description": description,
                "picked": picked
            };
        };
        return new Promise((resolve) => {
            vscode.window.showQuickPick([
                createItem("7.0", "Business Central 2021 release wave 1", true),
                createItem("6.0", "Business Central 2020 release wave 2"),
                createItem("5.0", "Business Central 2020 release wave 1"),
                createItem("4.0", "Business Central 2019 release wave 2"),
                createItem("3.0", "Business Central Spring '19 Release"),
                createItem("2.0", "Business Central Fall '18 Release"),
                createItem("1.0", "Business Central Spring '18 Release")
            ], options).then(target => {
                resolve([dir, target.label]);
            });
        });
    }
    chooseRootPath(initialPath) {
        const options = ({
            prompt: resources_1.default.folderPathPrompt,
            placeHolder: resources_1.default.folderPathPlaceholder,
            value: initialPath,
            validateInput: (dir) => {
                if (!path.isAbsolute(dir)) {
                    return resources_1.default.folderPathAbsoluteError;
                }
                return null;
            }
        });
        return new Promise((resolve, reject) => {
            vscode.window.showInputBox(options).then(dir => {
                if (!dir) {
                    return reject();
                }
                try {
                    fsHelpers_1.mkdirpSync(dir);
                }
                catch (e) {
                    vscode.window.showErrorMessage(resources_1.default.folderPathError);
                    return reject(e);
                }
                resolve(dir);
            });
        });
    }
    initializeCurrentFolder() {
        return this.initalizeDebugAdapterService.generateLaunchJson()
            .then(() => this.initalizeDebugAdapterService.openLaunchJson())
            .then(() => this.symbolsService.downloadSymbols(true))
            .then(() => {
            const w = workspaceHelpers.getCurrentWorkspaceFolderPath();
            if (w) {
                const defaultFilePath = path.join(w, constants_1.DefaultAlFileName);
                return vscodeHelpers_1.openTextDocument(defaultFilePath);
            }
            return Promise.reject(resources_2.default.noActiveWorkspaceFolder);
        })
            .then(() => { })
            .catch(() => {
            // ignore
        });
    }
}
exports.BootstrapService = BootstrapService;
//# sourceMappingURL=bootstrapService.js.map