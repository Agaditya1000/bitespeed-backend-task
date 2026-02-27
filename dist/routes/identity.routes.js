"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identity_controller_1 = require("../controllers/identity.controller");
const router = (0, express_1.Router)();
router.post('/', identity_controller_1.identifyContact);
exports.default = router;
