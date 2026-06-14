"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var orchestrator_1 = require("./orchestrator");
var agents_1 = require("./agents");
var router = (0, express_1.Router)();
router.use("/orchestrator", orchestrator_1.default);
router.use("/agents", agents_1.default);
// Add more modules/routing as you expand
exports.default = router;
