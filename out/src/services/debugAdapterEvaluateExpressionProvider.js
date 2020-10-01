"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
class DebugAdapterEvaluateExpressionProvider {
    constructor() {
    }
    provideEvaluatableExpression(document, position, token) {
        if (vscode.debug.activeDebugSession) {
            return vscode.debug.activeDebugSession.customRequest(constants_1.AlProvideDebuggerEvaluateExpression, { Uri: document.uri.fsPath, Position: position });
        }
        return undefined;
    }
}
exports.DebugAdapterEvaluateExpressionProvider = DebugAdapterEvaluateExpressionProvider;
//# sourceMappingURL=debugAdapterEvaluateExpressionProvider.js.map