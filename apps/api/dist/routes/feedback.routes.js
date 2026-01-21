"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController = __importStar(require("../controllers/feedback.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get feedback for a submission (student or professor)
router.get('/submissions/:submissionId/feedback', feedbackController.getFeedback);
// Create feedback for a submission (professors only)
router.post('/submissions/:submissionId/feedback', (0, auth_middleware_1.authorize)('profesor'), feedbackController.createFeedback);
// Update feedback for a submission (professors only)
router.put('/submissions/:submissionId/feedback', (0, auth_middleware_1.authorize)('profesor'), feedbackController.updateFeedback);
// Create annotation on a file (professors only)
router.post('/feedback/:feedbackId/annotations', (0, auth_middleware_1.authorize)('profesor'), feedbackController.createAnnotation);
// Delete annotation (professors only)
router.delete('/feedback/annotations/:annotationId', (0, auth_middleware_1.authorize)('profesor'), feedbackController.deleteAnnotation);
exports.default = router;
//# sourceMappingURL=feedback.routes.js.map