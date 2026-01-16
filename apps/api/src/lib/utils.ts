export function getIdParam(params: any): string {
  const id = params.id || params.assignmentId || params.submissionId || params.fileId;
  if (Array.isArray(id)) {
    return id[0];
  }
  return id;
}
