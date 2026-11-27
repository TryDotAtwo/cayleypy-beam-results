declare const externalSolutions: {
  fetch(request: Request, env: { DB: D1Database; UPLOAD_TOKEN?: string }): Promise<Response>;
};
export default externalSolutions;
