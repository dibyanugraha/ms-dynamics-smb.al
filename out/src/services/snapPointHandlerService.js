"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
class SnapPointHandlerService {
    constructor() {
        // We collect the snappoints that are sent by the DAP and we delete them as the debugging session ends.
        this.snapPoints = new Map();
    }
    /**
   * A session with the debug adapter is about to be started.
   */
    onWillStartSession() {
    }
    ;
    /**
     * The debug adapter is about to receive a Debug Adapter Protocol message from VS Code.
     */
    onWillReceiveMessage(message) {
    }
    ;
    /**
     * The debug adapter has sent a Debug Adapter Protocol message to VS Code.
     */
    onDidSendMessage(message) {
        let breakpoints = this.getSnapoints(message);
        if (breakpoints) {
            vscode.debug.addBreakpoints(breakpoints);
        }
    }
    ;
    /**
     * The debug adapter session is about to be stopped.
     */
    onWillStopSession() {
    }
    ;
    /**
     * An error with the debug adapter has occured.
     */
    onError(error) {
        this.removeSnappoints();
    }
    ;
    /**
     * The debug adapter has exited with the given exit code or signal.
     */
    onExit(code, signal) {
        this.removeSnappoints();
    }
    ;
    getSnapoints(message) {
        var _a, _b;
        if (message.type === 'event') {
            const responseMessage = message;
            if (responseMessage.event === constants_1.AlUpdateSnapPointEvent) {
                const vsCodeBreakpoints = [];
                const breakpoints = (_a = responseMessage.body) === null || _a === void 0 ? void 0 : _a.breakpoints;
                if (breakpoints) {
                    for (const b of breakpoints) {
                        if (!b.id || !this.snapPoints.has(b.id)) {
                            const path = vscode.Uri.file(b.source.path);
                            const position = new vscode.Position(b.line, b.column);
                            const location = new vscode.Location(path, position);
                            const message = b.message;
                            const sourceBreakpoint = new vscode.SourceBreakpoint(location, b.verified, '', '', message);
                            // See if we have a breakpoint on that location  and line.
                            const existingBreakpoint = this.getBreakpointAtLocation(sourceBreakpoint);
                            if (!existingBreakpoint) {
                                // The snappoints added here will be removed.
                                this.snapPoints.set((_b = b.id, (_b !== null && _b !== void 0 ? _b : 0)), sourceBreakpoint);
                            }
                            else {
                                vscode.debug.removeBreakpoints([existingBreakpoint]);
                            }
                            vsCodeBreakpoints.push(sourceBreakpoint);
                        }
                    }
                }
                return vsCodeBreakpoints;
            }
            return [];
        }
    }
    removeSnappoints() {
        let breakpoints = [];
        for (const bp of this.snapPoints.values()) {
            breakpoints.push(bp);
        }
        if (breakpoints.length > 0) {
            vscode.debug.removeBreakpoints(breakpoints);
        }
    }
    getBreakpointAtLocation(sourceBreakpoint) {
        for (const bp of vscode.debug.breakpoints) {
            const sbp = bp;
            if (sbp.location.uri.fsPath.toLowerCase() === sourceBreakpoint.location.uri.fsPath.toLowerCase() &&
                sbp.location.range.start.line === sourceBreakpoint.location.range.start.line) {
                return sbp;
            }
        }
        return undefined;
    }
}
exports.SnapPointHandlerService = SnapPointHandlerService;
//# sourceMappingURL=snapPointHandlerService.js.map