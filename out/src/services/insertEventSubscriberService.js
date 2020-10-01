"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const extensionService_1 = require("./extensionService");
const serverProxy_1 = require("./serverProxy");
const vscode = require("vscode");
class InsertEventSubscriberService extends extensionService_1.ExtensionService {
    constructor(context, languageServerClient) {
        super(context);
        this.languageServerClient = languageServerClient;
        this.serverProxy = new serverProxy_1.ServerProxy(languageServerClient);
    }
    activate() {
        this.registerFolderCommand("al.insertEvent", () => this.insertEvent());
    }
    insertEvent() {
        return this.getEventPublishers().then(events => this.selectEvent(events)).then(event => {
            if (event != null) {
                let snippet;
                snippet = new vscode.SnippetString(event.signature);
                vscode.window.activeTextEditor.insertSnippet(snippet);
            }
        });
    }
    getEventPublishers() {
        return this.languageServerClient.sendRequest(constants_1.AlGetEventPublishersRequest);
    }
    selectEvent(events) {
        const options = ({
            placeHolder: "Select Event",
            matchOnDetail: false,
            matchOnDescription: true,
            canPickMany: false,
            ignoreFocusOut: true,
        });
        return vscode.window.showQuickPick(events, options).then(item => {
            return item;
        });
    }
}
exports.InsertEventSubscriberService = InsertEventSubscriberService;
//# sourceMappingURL=insertEventSubscriberService.js.map