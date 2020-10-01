"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlExtensionName = "AL Language";
exports.AlExtensionContextName = "alExtensionActive";
exports.AlLanguageId = "al";
exports.AlLanguageClientName = "AL";
exports.AlProjectFileName = "app.json";
exports.AlPreviewSchema = "al-preview";
exports.AlOpenPreviewDocumentCommand = "openAlResource";
exports.ReferenceApplicationFileBasedGotoDefinitionMinVersion = 5.2;
exports.AlCreatePackageRequest = "al/createPackage";
exports.AlDownloadSymbolsRequest = "al/downloadSymbols";
exports.AlCheckSymbolsRequest = "al/checkSymbols";
exports.AlSetActiveWorkspace = "al/setActiveWorkspace";
exports.AlSymbolsMissingEvent = "al/symbolsMissing";
exports.AlManifestMissingEvent = "al/manifestMissing";
exports.AlDownloadSourceRequest = "al/downloadSource";
exports.AlOpenPageDesignerRequest = "al/openPageDesigner";
exports.AlSaveUsernamePasswordRequest = "al/saveUsernamePassword";
exports.AlCheckAuthenticatedRequest = "al/checkAuthenticated";
exports.AlOpenPreviewDocument = "al/previewDocument";
exports.AlDeviceLoginEvent = "al/deviceLogin";
exports.AlClearCredentialsCacheRequest = "al/clearCredentialsCache";
exports.AlGotoDefinitionRequest = "al/gotodefinition";
exports.AlGeneratePermissionSetRequest = "al/generatePermissionSet";
exports.AlGenerateEntitlementsRequest = "al/generateEntitlements";
exports.AlOpenEventRecorderRequest = "al/openEventRecorder";
exports.AlReloadRadFileRequest = "al/reloadRadFile";
exports.AlSynchronizeProjectDependenciesRequest = "al/synchronizeProjectDependencies";
exports.AlRefreshSymbolReferencesRequest = "al/refreshsymbolreferencesrequest";
exports.AlGetEventPublishersRequest = "al/getEventPublishersRequest";
exports.AlProvideDebuggerEvaluateExpression = "al/provideDebuggerEvaluateExpression";
exports.AlInitializeSnapshotDebuggerAttachRequest = "al/initializeSnapshotDebuggerAttach";
exports.AlFinishSnapshotDebuggerSessionRequest = "al/finishSnapshotDebuggerSessionRequest";
exports.AlSnapshotStatusRequest = "al/snapshotDebuggerSessionStatusRequest";
exports.AlUpdateSnapPointEvent = "al/updateSnappointsEvent";
exports.AlPublish = "al/publish";
// For some reason the workspace/didChangeWorkspaceFolders is not emmitted by the client. Maybe because
// it is still at proposal as of version 3.5 of the language client.
exports.AlDidChangeWorkspaceFolders = "al/didChangeWorkspaceFolders";
// This is a response from the server to open dependent projects in a chain.
exports.AlOpenDependentProjects = "al/openDependentProjects";
// Default implementation for this endpoint is not sufficient for our extension.
exports.WorkspaceConfiguration = "workspace/configuration";
exports.InitialProjectName = "ALProject";
exports.DefaultAlFileName = "HelloWorld.al";
exports.UserIdFile = "bin/userid.txt";
/** A key in the global state where the folder path to be bootstrapped is stored */
exports.GoStateKey = "al:go";
exports.SymbolsCheckedStateKey = "al:symbolsChecked";
exports.UserIdStateKey = "al:userid";
exports.DefaultPackageCachePath = ".vscode";
// Setting names
exports.AssemblyProbingPathsSetting = "assemblyProbingPaths";
exports.CodeAnalyzersSetting = "codeAnalyzers";
exports.EnableCodeAnalysisSetting = "enableCodeAnalysis";
exports.BackgroundCodeAnalysisSetting = "backgroundCodeAnalysis";
exports.PackageCachePathSetting = "packageCachePath";
exports.RuleSetPathSetting = "ruleSetPath";
exports.EnableCodeActionsSetting = "enableCodeActions";
exports.IncrementalBuildSetting = "incrementalBuild";
exports.CompilationOptionsSetting = "compilationOptions";
exports.FileScheme = "file";
exports.SnapshotJSONFileName = "snapshots.json";
exports.DeserializeSnapshotContextInterval = 30 * 60 * 1000;
exports.SnapshotFileNameExtension = ".zip";
exports.DalExtensionName = ".dal";
exports.localeDateTimeOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit", second: "2-digit" };
//# sourceMappingURL=constants.js.map