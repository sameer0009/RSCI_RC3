import { csrfProtection } from '../security.middleware';
import { paginationBounds } from '../input.middleware';

function response() { const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() }; return res; }
describe('request security', () => {
  beforeEach(() => { process.env.FRONTEND_URL = 'https://school.example'; delete process.env.CORS_ORIGIN; });
  test.each(['https://school.example.evil.test', 'https://school.example@evil.test', 'null', 'garbage'])('rejects hostile origin %s', origin => {
    const res = response(), next = jest.fn();
    csrfProtection({ method: 'POST', get: (key: string) => key === 'origin' ? origin : 'https://school.example/safe', cookies: { accessToken: 'session' } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled();
  });
  test('allows exact origin', () => {
    const next = jest.fn(); csrfProtection({ method: 'POST', get: () => 'https://school.example', cookies: {} } as any, response(), next); expect(next).toHaveBeenCalled();
  });
  test('rejects cookie mutation with no origin', () => {
    const res = response(); csrfProtection({ method: 'POST', get: () => undefined, cookies: { refreshToken: 'session' } } as any, res, jest.fn()); expect(res.status).toHaveBeenCalledWith(403);
  });
  test('allows non-browser bearer clients', () => {
    const next = jest.fn(); csrfProtection({ method: 'POST', get: () => undefined, cookies: {} } as any, response(), next); expect(next).toHaveBeenCalled();
  });
  test.each(['0', '-1', 'NaN', '101', ['2']])('rejects invalid limit %s', limit => {
    const res = response(); paginationBounds({ query: { limit } } as any, res, jest.fn()); expect(res.status).toHaveBeenCalledWith(400);
  });
});
