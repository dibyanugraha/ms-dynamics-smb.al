"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const vscode = require("vscode");
const fs = require("fs");
const extensionService_1 = require("./extensionService");
// This class handles breakpoints that fall out of the debug adpater's responsibility.
// E.g : Removing al files with breakpoints.
class AlLanguageClientBreakpointCleanupHandlerService extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
        this.alFileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.al');
        // Added for testability
        this.removeBreakpointCalled = new vscode.EventEmitter();
        // This is a nasty hack. It is needed since vscode does not initialize vscode.debug.breakpoints unless
        // someone registers with this event.
        // To be more precise the vscode.debug.breakpoints is only initialized at a second attempt within an
        // alFileSystemWatcher event.
        this.registerForDisposal(vscode.debug.onDidChangeBreakpoints(e => this.onDidChangeBreakpoints(e)));
        this.registerForDisposal(this.alFileSystemWatcher.onDidDelete(uri => this.handleAlFileDeleted(uri)));
        this.registerForDisposal(this.alFileSystemWatcher.onDidChange(uri => this.handleAlFileChanged(uri)));
    }
    get onRemoveBreakpointCalled() {
        return this.removeBreakpointCalled.event;
    }
    handleAlFileDeleted(uri) {
        this.removeBreakpoints(uri);
    }
    handleAlFileChanged(uri) {
        if (!fs.existsSync(uri.fsPath)) {
            this.removeBreakpoints(uri);
        }
    }
    removeBreakpoints(uri) {
        let breakpointsToRemove = [];
        for (const breakpoint of vscode.debug.breakpoints) {
            let sourceBreakpoint = breakpoint;
            if (sourceBreakpoint && sourceBreakpoint.location && sourceBreakpoint.location.uri.fsPath.toLowerCase() === uri.fsPath.toLowerCase()) {
                breakpointsToRemove.push(sourceBreakpoint);
            }
        }
        if (breakpointsToRemove.length > 0) {
            vscode.debug.removeBreakpoints(breakpointsToRemove);
            this.removeBreakpointCalled.fire(uri);
        }
    }
    onDidChangeBreakpoints(e) {
    }
}
exports.AlLanguageClientBreakpointCleanupHandlerService = AlLanguageClientBreakpointCleanupHandlerService;
//# sourceMappingURL=AlLanguageClientBreakpointCleanupHandlerService.js.map