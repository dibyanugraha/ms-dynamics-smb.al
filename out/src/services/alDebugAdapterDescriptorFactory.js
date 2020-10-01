"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const vscode = require("vscode");
const constants_1 = require("../constants");
const alDapProtocolMessageLogger_1 = require("../alDapProtocolMessageLogger");
const configurationHelpers_1 = require("../configurationHelpers");
const extensionService_1 = require("./extensionService");
const snapPointHandlerService_1 = require("./snapPointHandlerService");
const alDebugAdapterTracker_1 = require("../alDebugAdapterTracker");
class AlDebugAdapterDescriptorFactory extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
        this.registerDebugAdapterFactory();
    }
    createDebugAdapterDescriptor(session, executable) {
        return this.createDescriptor(session);
    }
    registerDebugAdapterFactory() {
        vscode.debug.registerDebugAdapterTrackerFactory(constants_1.AlLanguageId, {
            createDebugAdapterTracker(session) {
                let proxies = [];
                if (session.configuration['traceDap']) {
                    proxies.push(new alDapProtocolMessageLogger_1.AlDapProtocolMessageLogger(session));
                }
                proxies.push(new snapPointHandlerService_1.SnapPointHandlerService());
                return new alDebugAdapterTracker_1.AlDebugAdapterTracker(proxies);
            }
        });
    }
    createDescriptor(session) {
        const launchWs = session.workspaceFolder;
        const args = ["/startDebugging"];
        for (const arg of configurationHelpers_1.getLanguageServerOptions()) {
            args.push(arg);
        }
        args.push("/projectRoot:" + launchWs.uri.fsPath);
        const serverPath = this.getServerPath();
        const executable = new vscode.DebugAdapterExecutable(serverPath, args);
        return Promise.resolve(executable);
    }
}
exports.AlDebugAdapterDescriptorFactory = AlDebugAdapterDescriptorFactory;
//# sourceMappingURL=alDebugAdapterDescriptorFactory.js.map