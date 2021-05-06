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
        const publishOnly = this.getPublishOnlyConfig(debugConfiguration);
        if (debugConfiguration.request === initalizeDebugAdapterService_1.DebugConfigurationType.Launch &&
            !debugConfiguration.isResolved) {
            const buildService = this.initalizeDebugAdapterService.BuildService;
            if (buildService) {
                // This is the scenario when we are called either from :
                // a. Clicking the Run\Start Debugging or Run\Run without debugging menu items
                // b. Or the Start Debugging button was clicked with an AL configuration selected.
                // We want to do exactly the same as if al.publish or the al.publishNoDebug commands have been called.
                // That is we want to issue a build before starting the publishing/debugging.
                return buildService.build(false).then(() => this.initalizeDebugAdapterService.resolveDebugConfiguration(publishOnly, false, false, debugConfiguration));
            }
        }
        // ALl F5 based operations (Ctrl F5, Shift Ctrl F5) end up here, besides clicking on the debug button will end up here.
        // We have to be sure that we preserve existing state which is always set when we issue an F5 based operation.
        // Do not pass undefined, just initialize to false if undefined.
        const isRad = debugConfiguration.isRad !== undefined ? debugConfiguration.isRad : false;
        let justDebug = false;
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
    getPublishOnlyConfig(debugConfiguration) {
        let publishOnly = false;
        if (debugConfiguration.publishOnly !== undefined) {
            publishOnly = debugConfiguration.publishOnly;
        }
        else if (debugConfiguration.noDebug !== undefined) {
            // Set by the command Ctrl F5 issued from VScode.
            publishOnly = debugConfiguration.noDebug;
        }
        return publishOnly;
    }
}
exports.AlDebugConfigurationProvider = AlDebugConfigurationProvider;
//# sourceMappingURL=alDebugConfigurationProvider.js.map