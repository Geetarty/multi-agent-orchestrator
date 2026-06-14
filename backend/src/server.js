"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "1mb" }));
app.use("/api", routes_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
const port = Number(process.env.PORT ?? 3000);
if (require.main === module) {
    app.listen(port, () => {
        logger_1.logger.info(`Server listening on port ${port}`);
    });
}
exports.default = app;
