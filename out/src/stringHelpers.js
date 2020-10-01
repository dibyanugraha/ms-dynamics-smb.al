"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function stringIsNullOrEmpty(value) {
    return !value || value.trim().length === 0;
}
exports.stringIsNullOrEmpty = stringIsNullOrEmpty;
function sanitizeFilename(filename) {
    return filename.split("").filter(isValidFilesystemChar).join("").trim();
}
exports.sanitizeFilename = sanitizeFilename;
const invalidChars = [":", "/", "\\", "?", "<", ">", "*", "|", "\""];
function isValidFilesystemChar(char) {
    if (char <= "\u001f" || (char >= "\u0080" && char <= "\u009f")) {
        return false;
    }
    return invalidChars.indexOf(char) === -1;
}
exports.isValidFilesystemChar = isValidFilesystemChar;
//# sourceMappingURL=stringHelpers.js.map