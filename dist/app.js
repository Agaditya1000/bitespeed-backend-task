"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const identity_routes_1 = __importDefault(require("./routes/identity.routes"));
const error_handler_1 = require("./utils/error.handler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Main identity router
app.use('/identify', identity_routes_1.default);
// Global Error Handler
app.use(error_handler_1.errorHandler);
exports.default = app;
