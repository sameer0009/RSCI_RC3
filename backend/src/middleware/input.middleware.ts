import { RequestHandler } from 'express';

export const paginationBounds: RequestHandler = (req, res, next) => {
  for (const key of ['page', 'limit']) {
    const value = req.query[key];
    if (value !== undefined && (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > (key === 'limit' ? 100 : 100000))) {
      return void res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `${key} is out of range` } });
    }
  }
  next();
};

// Runtime allowlists: TypeScript DTOs do not sanitize incoming JSON.
export const fields = (allowed: string[]): RequestHandler => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return void res.status(400).json({ success: false });
  const unknown = Object.keys(req.body).filter(key => !allowed.includes(key));
  if (unknown.length) return void res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Unsupported request fields' } });
  next();
};
export const problemFields = ['title','description','inputFormat','outputFormat','constraints','difficulty','topics','timeLimit','memoryLimit','isGlobal','points','testCases','status','validationStrategy','floatingPointEpsilon','enablePartialScoring','maxSourceSize','allowedLanguages','hints','examples','languageTimeLimits','languageMemoryLimits','problemType'];
