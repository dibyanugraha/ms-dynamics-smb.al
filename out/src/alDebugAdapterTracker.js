"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlDebugAdapterTracker {
    constructor(proxies) {
        this.proxies = proxies;
    }
    addProxy(proxyTracker) {
        this.proxies.push(proxyTracker);
    }
    /**
   * A session with the debug adapter is about to be started.
   */
    onWillStartSession() {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onWillStartSession(); });
    }
    ;
    /**
     * The debug adapter is about to receive a Debug Adapter Protocol message from VS Code.
     */
    onWillReceiveMessage(message) {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onWillReceiveMessage(message); });
    }
    ;
    /**
     * The debug adapter has sent a Debug Adapter Protocol message to VS Code.
     */
    onDidSendMessage(message) {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onDidSendMessage(message); });
    }
    ;
    /**
     * The debug adapter session is about to be stopped.
     */
    onWillStopSession() {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onWillStopSession(); });
    }
    ;
    /**
     * An error with the debug adapter has occured.
     */
    onError(error) {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onError(error); });
    }
    ;
    /**
     * The debug adapter has exited with the given exit code or signal.
     */
    onExit(code, signal) {
        this.proxies.forEach(p => { var _a; return (_a = p) === null || _a === void 0 ? void 0 : _a.onExit(code, signal); });
    }
    ;
}
exports.AlDebugAdapterTracker = AlDebugAdapterTracker;
//# sourceMappingURL=alDebugAdapterTracker.js.map