/**
 * @jest-environment node
 */

describe('Prisma Client', () => {
  it('should be configured correctly', () => {
    // Simple test to verify the prisma module can be loaded
    expect(() => require('../prisma')).not.toThrow();
  });

  it('should export prisma client', () => {
    const { prisma } = require('../prisma');
    expect(prisma).toBeDefined();
  });
});
