"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const initalizeDebugAdapterService_1 = require("./initalizeDebugAdapterService");
const constants_1 = require("../constants");
const snapshotDebugger_1 = require("./snapshotDebugger");
class AlDebugConfigurationProvider {
    constructor(initalizeDebugAdapterService) {
        this.initalizeDebugAdapterService = initalizeDebugAdapterService;
    }
    provideDebugConfigurations(folder, token) {
        return this.initalizeDebugAdapterService.getInitialConfigurations();
    }
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        if (!debugConfiguration) {
            // Returning null will open the config file.
            return null;
        }
        if (debugConfiguration.type != constants_1.AlLanguageId) {
            return null;
        }
        if (snapshotDebugger_1.isSnapshotDebuggerConfiguration(debugConfiguration)) {
            return Promise.resolve(debugConfiguration);
        }
        // ALl F5 based operations (Ctrl F5, Shift Ctrl F5) end up here, besides clicking on the debug button will end up here.
        // We have to be sure that we preserve existing state which is always set when we issue an F5 based operation.
        // Do not pass undefined, just initialize to false if undefined.
        const isRad = debugConfiguration.isRad !== undefined ? debugConfiguration.isRad : false;
        const publishOnly = debugConfiguration.publishOnly !== undefined ? debugConfiguration.publishOnly : false;
        let justDebug = false;
        // If we click the debug button then we will do as Ctrl Shift F5 does.
        // Basically clicking on the debug button means that we want to debug without publishing.
        // This is by design since we do not want to triger a build on the language server at this point.
        // Eventhough the DAP protocol is not initiated it is still comsifdered to be part this of the DAP API.
        if (!isRad && !publishOnly) {
            justDebug = debugConfiguration.justDebug !== undefined ? debugConfiguration.justDebug : true;
        }
        if (debugConfiguration.request === initalizeDebugAdapterService_1.DebugConfigurationType.Launch || debugConfiguration.request === initalizeDebugAdapterService_1.DebugConfigurationType.Attach) {
            return this.initalizeDebugAdapterService.resolveDebugConfiguration(publishOnly, isRad, justDebug, debugConfiguration);
        }
        else {
            // Do not start debugging but instead open the debug configuration.
            return null;
        }
    }
}
exports.AlDebugConfigurationProvider = AlDebugConfigurationProvider;
//# sourceMappingURL=alDebugConfigurationProvider.js.map