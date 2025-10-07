import { SecurityValidator } from './securityValidation';

describe('SecurityValidator', () => {
  describe('validateInput', () => {
    it('should prevent prototype pollution', () => {
      const maliciousPayload = JSON.parse('{"__proto__": {"polluted": "true"}}');
      const { isValid, errors } = SecurityValidator.validateInput(maliciousPayload);

      expect(isValid).toBe(false);
      expect(errors).toContain('Prototype pollution attempt detected');

      const obj: any = {};
      expect(obj.polluted).toBeUndefined();
    });
  });
});