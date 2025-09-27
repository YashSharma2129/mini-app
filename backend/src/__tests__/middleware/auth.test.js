const jwt = require('jsonwebtoken');
const pool = require('../../config/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

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
    test('should authenticate valid token', async () => {
      const mockUser = { userId: 1, role: 'user' };
      const mockDbUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'user' };
      
      jwt.verify.mockReturnValue(mockUser);
      pool.query.mockResolvedValue({ rows: [mockDbUser] });

      req.headers.authorization = 'Bearer valid-token';

      await authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, email, name, role FROM users WHERE id = $1',
        [1]
      );
      expect(req.user).toEqual(mockDbUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 for missing token', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 for invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      req.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for malformed authorization header', async () => {
      req.headers.authorization = 'InvalidFormat';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
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
        message: 'Insufficient permissions'
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
        message: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
