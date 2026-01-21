"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdParam = getIdParam;
function getIdParam(params) {
    const id = params.id || params.assignmentId || params.submissionId || params.fileId;
    if (Array.isArray(id)) {
        return id[0];
    }
    return id;
}
//# sourceMappingURL=utils.js.map