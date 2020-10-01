"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("./constants");
const resources_1 = require("./resources");
const snapshotDebugger_1 = require("./services/snapshotDebugger");
function getCompilerOptions() {
    const args = [];
    const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId);
    const compilationOptions = alConfig.get("compilationOptions");
    if (compilationOptions instanceof Object) {
        if (compilationOptions.generateReportLayout !== undefined) {
            args.push("/generateReportLayout" + (compilationOptions.generateReportLayout ? "+" : "-"));
        }
        if (compilationOptions.parallel !== undefined) {
            args.push("/parallel" + (compilationOptions.parallel ? "+" : "-"));
        }
        if (compilationOptions.maxDegreeOfParallelism !== undefined && compilationOptions.maxDegreeOfParallelism > 0) {
            args.push("/maxDegreeOfParallelism:" + compilationOptions.maxDegreeOfParallelism);
        }
    }
    return args;
}
exports.getCompilerOptions = getCompilerOptions;
function getLanguageServerOptions() {
    const args = [];
    const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId);
    if (alConfig.get("debug")) {
        args.push("/waitForDebugger");
    }
    const telemetryConfig = vscode.workspace.getConfiguration("telemetry");
    const telemetryEnabled = telemetryConfig.get("enableTelemetry");
    if (telemetryEnabled === false) {
        args.push("/disableTelemetry");
    }
    addArg(args, alConfig, "env");
    addArg(args, alConfig, "browser");
    addArg(args, alConfig, "incognito");
    addArg(args, alConfig, "editorServicesLogLevel", "logLevel");
    const compilationOptions = alConfig.get("compilationOptions");
    if (compilationOptions instanceof Object) {
        if (compilationOptions.delayAfterLastDocumentChange !== undefined) {
            args.push("/delayAfterLastDocumentChange:" + compilationOptions.delayAfterLastDocumentChange);
        }
        if (compilationOptions.delayAfterLastProjectChange !== undefined) {
            args.push("/delayAfterLastProjectChange:" + compilationOptions.delayAfterLastProjectChange);
        }
    }
    return args;
}
exports.getLanguageServerOptions = getLanguageServerOptions;
function addArg(args, config, configSettingName, commandLineSettingName = configSettingName) {
    const setting = config.get(configSettingName);
    if (setting) {
        args.push(`/${commandLineSettingName}:${setting}`);
    }
}
function getAlParams() {
    const alConfig = vscode.workspace.getConfiguration(constants_1.AlLanguageId);
    const alParams = {
        browserInfo: {
            browser: alConfig.get("browser"),
            incognito: alConfig.get("incognito")
        },
        environmentInfo: {
            env: alConfig.get("env")
        }
    };
    if (alParams.browserInfo.incognito && alParams.browserInfo.browser === "SystemDefault") {
        vscode.window.showErrorMessage(resources_1.default.incognitoRequiresBrowserSetting);
    }
    return alParams;
}
exports.getAlParams = getAlParams;
function ensureAuthenticated(configuration, serverProxy) {
    if (snapshotDebugger_1.isSnapshotDebuggerConfiguration(configuration)) {
        return Promise.resolve(configuration);
    }
    const params = getAlParams();
    return new Promise((resolve, reject) => {
        serverProxy.ensureAuthenticated(configuration, params)
            .then(() => resolve(configuration), reject);
    });
}
exports.ensureAuthenticated = ensureAuthenticated;
//# sourceMappingURL=configurationHelpers.js.map