"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const vscode = require("vscode");
const constants_1 = require("../constants");
const workspaceFolderHelpers_1 = require("../workspaceFolderHelpers");
function getWorkspaceSettings(workspacePath, setActiveWorkspace, dependencyParentWorkspacePath) {
    workspacePath = workspacePath === undefined ? workspaceFolderHelpers_1.getCurrentWorkspaceFolderPath() : workspacePath;
    const fileUri = workspacePath !== undefined ? vscode.Uri.file(workspacePath) : null;
    const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId, fileUri);
    const settings = {
        workspacePath: workspacePath,
        alResourceConfigurationSettings: {
            assemblyProbingPaths: alConfig.get(constants_1.AssemblyProbingPathsSetting),
            codeAnalyzers: alConfig.get(constants_1.CodeAnalyzersSetting),
            enableCodeAnalysis: alConfig.get(constants_1.EnableCodeAnalysisSetting),
            backgroundCodeAnalysis: alConfig.get(constants_1.BackgroundCodeAnalysisSetting),
            packageCachePath: alConfig.get(constants_1.PackageCachePathSetting),
            ruleSetPath: alConfig.get(constants_1.RuleSetPathSetting),
            enableCodeActions: alConfig.get(constants_1.EnableCodeActionsSetting),
            incrementalBuild: alConfig.get(constants_1.IncrementalBuildSetting)
        },
        setActiveWorkspace: setActiveWorkspace == undefined ? true : setActiveWorkspace,
        dependencyParentWorkspacePath: dependencyParentWorkspacePath
    };
    const compilationOptions = alConfig.get(constants_1.CompilationOptionsSetting);
    if (compilationOptions !== undefined) {
        if (compilationOptions.generateReportLayout !== undefined) {
            settings.alResourceConfigurationSettings.generateReportLayout = compilationOptions.generateReportLayout;
        }
        if (compilationOptions.parallel !== undefined) {
            settings.alResourceConfigurationSettings.parallelBuild = compilationOptions.parallel;
        }
        if (compilationOptions.maxDegreeOfParallelism !== undefined) {
            settings.alResourceConfigurationSettings.maxDegreeOfParallelism = compilationOptions.maxDegreeOfParallelism;
        }
    }
    return settings;
}
exports.getWorkspaceSettings = getWorkspaceSettings;
//# sourceMappingURL=settings.js.map