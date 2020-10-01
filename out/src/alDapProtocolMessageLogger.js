"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlDapProtocolMessageLogger {
    constructor(session) {
        this.session = session;
    }
    /**
   * A session with the debug adapter is about to be started.
   */
    onWillStartSession() {
        console.log(`start: ${this.session.id}`);
    }
    ;
    /**
     * The debug adapter is about to receive a Debug Adapter Protocol message from VS Code.
     */
    onWillReceiveMessage(message) {
        console.log(`===> ${JSON.stringify(message, undefined, 2)}`);
    }
    ;
    /**
     * The debug adapter has sent a Debug Adapter Protocol message to VS Code.
     */
    onDidSendMessage(message) {
        console.log(`<=== ${JSON.stringify(message, undefined, 2)}`);
    }
    ;
    /**
     * The debug adapter session is about to be stopped.
     */
    onWillStopSession() {
        console.log(`stop: ${this.session.id}`);
    }
    ;
    /**
     * An error with the debug adapter has occured.
     */
    onError(error) {
        console.log(`error: ${error}`);
    }
    ;
    /**
     * The debug adapter has exited with the given exit code or signal.
     */
    onExit(code, signal) {
        console.log(`exit: ${code}`);
    }
    ;
}
exports.AlDapProtocolMessageLogger = AlDapProtocolMessageLogger;
//# sourceMappingURL=alDapProtocolMessageLogger.js.map