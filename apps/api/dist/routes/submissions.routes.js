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
const submissionsController = __importStar(require("../controllers/submissions.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_helper_1 = require("../lib/upload-helper");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get my submission for an assignment (student only)
router.get('/assignments/:assignmentId/my-submission', (0, auth_middleware_1.authorize)('estudiante'), submissionsController.getMySubmission);
// Get submissions for an assignment (professor only)
router.get('/assignments/:assignmentId/submissions', (0, auth_middleware_1.authorize)('profesor'), submissionsController.getSubmissionsForAssignment);
// Get single submission (professor or own student submission)
router.get('/submissions/:id', submissionsController.getSubmission);
// Create or update submission (students only)
router.post('/assignments/:assignmentId/submissions', (0, auth_middleware_1.authorize)('estudiante'), submissionsController.createOrUpdateSubmission);
// Submit assignment (change status to submitted)
router.put('/submissions/:id/submit', (0, auth_middleware_1.authorize)('estudiante'), submissionsController.submitAssignment);
// Upload file to submission
router.post('/submissions/:id/files', (0, upload_helper_1.getUploadSingleMiddleware)('submissions'), submissionsController.uploadFile);
// Delete file from submission
router.delete('/submissions/files/:fileId', submissionsController.deleteFile);
// Get professor statistics (professor only)
router.get('/profesor/stats', (0, auth_middleware_1.authorize)('profesor'), submissionsController.getProfessorStats);
exports.default = router;
//# sourceMappingURL=submissions.routes.js.map