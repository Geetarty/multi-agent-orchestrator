"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
var log = function (message) {
    console.log("[".concat(new Date().toISOString(), "] ").concat(message));
};
exports.log = log;
