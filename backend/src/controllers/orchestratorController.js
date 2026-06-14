"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = void 0;
var getStatus = function (req, res) {
    res.json({
        status: "ok",
        timestamp: Date.now(),
        orchestrator: "Multi-Agent Orchestrator running"
    });
};
exports.getStatus = getStatus;
