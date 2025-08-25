import { describe, it, expect, jest } from '@jest/globals';
import { APIErrorHandler } from '../../lib/error-handling';

describe('APIErrorHandler - Unit Tests', () => {
  describe('wrapAsync', () => {
    it('should handle successful operations', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      
      const result = await APIErrorHandler.wrapAsync(
        () => mockOperation(),
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.error).toBeUndefined();
    });

    it('should handle failed operations', async () => {
      const mockError = new Error('Test error');
      const mockOperation = jest.fn<() => Promise<string>>().mockRejectedValue(mockError);

      const result = await APIErrorHandler.wrapAsync(
        () => mockOperation(),
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    it('should handle operations that throw errors', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockImplementation(() => {
        throw new Error('Thrown error');
      });

      const result = await APIErrorHandler.wrapAsync(
        () => mockOperation(),
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      
      const result = await APIErrorHandler.withRetry(
        () => mockOperation(),
        3,
        100,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
      let callCount = 0;
      const mockOperation = jest.fn<() => Promise<string>>().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt failed');
        }
        return Promise.resolve('success');
      });
      
      const result = await APIErrorHandler.withRetry(
        () => mockOperation(),
        3,
        100,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockError = new Error('Persistent error');
      const mockOperation = jest.fn<() => Promise<string>>().mockRejectedValue(mockError);
      
      const result = await APIErrorHandler.withRetry(
        () => mockOperation(),
        3,
        100,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.attempts).toBe(3);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe('withTimeout', () => {
    it('should succeed within timeout', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      
      const result = await APIErrorHandler.withTimeout(
        () => mockOperation(),
        1000,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });

    it('should fail when operation times out', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('success'), 2000);
        });
      });
      
      const result = await APIErrorHandler.withTimeout(
        () => mockOperation(),
        100,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('withValidation', () => {
    it('should succeed when validation passes', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      const mockValidator = jest.fn<(data: string) => Promise<boolean>>().mockResolvedValue(true);
      
      const result = await APIErrorHandler.withValidation(
        () => mockOperation(),
        mockValidator,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(mockValidator).toHaveBeenCalledWith('success');
    });

    it('should fail when validation fails', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      const mockValidator = jest.fn<(data: string) => Promise<boolean>>().mockResolvedValue(false);
      
      const result = await APIErrorHandler.withValidation(
        () => mockOperation(),
        mockValidator,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });
});
