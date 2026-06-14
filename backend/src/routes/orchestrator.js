"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var orchestratorController_1 = require("../controllers/orchestratorController");
var router = (0, express_1.Router)();
router.get("/status", orchestratorController_1.getStatus);
exports.default = router;
