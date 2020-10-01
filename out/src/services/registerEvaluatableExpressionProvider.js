"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const debugAdapterEvaluateExpressionProvider_1 = require("./debugAdapterEvaluateExpressionProvider");
class RegisterEvaluatableExpressionProvider extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
        this.debugAdapterEvaluateExpressionProvider = new debugAdapterEvaluateExpressionProvider_1.DebugAdapterEvaluateExpressionProvider();
    }
    activate() {
        const sel = {
            scheme: constants_1.FileScheme,
            language: constants_1.AlLanguageId
        };
        vscode.languages.registerEvaluatableExpressionProvider(sel, this.debugAdapterEvaluateExpressionProvider);
    }
}
exports.RegisterEvaluatableExpressionProvider = RegisterEvaluatableExpressionProvider;
//# sourceMappingURL=registerEvaluatableExpressionProvider.js.map