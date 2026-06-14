"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var agentController_1 = require("../controllers/agentController");
var router = (0, express_1.Router)();
router.post("/compile", agentController_1.runCompilation);
exports.default = router;
