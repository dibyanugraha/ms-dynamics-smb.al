"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const extensionService_1 = require("./extensionService");
/**
 * The class for enhanced editing support for DocComments.
 */
class DocCommentService extends extensionService_1.ExtensionService {
    constructor(context) {
        super(context);
        this.registerForDisposal(vscode.workspace.onDidChangeTextDocument(e => this.onTextDocumentChanged(e)));
    }
    onTextDocumentChanged(e) {
        if (e.contentChanges.length === 1) {
            var changes = e.contentChanges[0];
            if (changes.range.start.line <= 0) {
                return;
            }
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor.document !== e.document) {
                return;
            }
            var s = changes.text;
            var NewLineLen = 0;
            if (s.startsWith('\r\n')) {
                NewLineLen = 2;
            }
            else if (s.startsWith('\n')) {
                NewLineLen = 1;
            }
            if (NewLineLen > 0) {
                var prevLine = activeEditor.document.lineAt(changes.range.start.line);
                var index = prevLine.firstNonWhitespaceCharacterIndex;
                if (prevLine.firstNonWhitespaceCharacterIndex >= prevLine.text.length - 3) {
                    return;
                }
                if (prevLine.text.substr(index, 3) === '///') {
                    // Previous line started with a DocComment
                    activeEditor.edit((e) => {
                        e.insert(new vscode.Position(prevLine.lineNumber + 1, changes.text.length - NewLineLen), '/// ');
                    });
                }
            }
        }
    }
}
exports.DocCommentService = DocCommentService;
//# sourceMappingURL=docCommentService.js.map