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
const constants_1 = require("../constants");
const initalizeDebugAdapterService_1 = require("./initalizeDebugAdapterService");
const resources_1 = require("../resources");
class SnapshotDebugger {
    constructor(context) {
        this.context = context;
    }
    initialize(folder, snapShotPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newConfig = {
                request: initalizeDebugAdapterService_1.DebugConfigurationType.Launch,
                name: resources_1.default.defaultSnapshotDebuggerConfigurationName,
                type: constants_1.AlLanguageId,
                snapshotFileName: snapShotPath
            };
            this.context.startDebugging(folder, newConfig);
        });
    }
}
exports.SnapshotDebugger = SnapshotDebugger;
function isSnapshotDebuggerConfiguration(config) {
    return config.request === initalizeDebugAdapterService_1.DebugConfigurationType.Launch && config.snapshotFileName;
}
exports.isSnapshotDebuggerConfiguration = isSnapshotDebuggerConfiguration;
function isSnapshotDebugAdapterConfiguration(config) {
    return config.snapshotFileName !== undefined;
}
exports.isSnapshotDebugAdapterConfiguration = isSnapshotDebugAdapterConfiguration;
function isSnapshotInitializeDebugConfiguration(config) {
    return config.request === initalizeDebugAdapterService_1.DebugConfigurationType.SnapshotInitialize;
}
exports.isSnapshotInitializeDebugConfiguration = isSnapshotInitializeDebugConfiguration;
//# sourceMappingURL=snapshotDebugger.js.map