const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    test('should authenticate valid token', () => {
      const mockUser = { userId: 1, role: 'user' };
      jwt.verify.mockReturnValue(mockUser);

      req.headers.authorization = 'Bearer valid-token';

      authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 for missing token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      req.headers.authorization = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    test('should allow access for user with required role', () => {
      req.user = { role: 'admin' };
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow access for user with one of multiple required roles', () => {
      req.user = { role: 'user' };
      const middleware = requireRole(['admin', 'user']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for user without required role', () => {
      req.user = { role: 'user' };
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access when user is not authenticated', () => {
      req.user = null;
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
