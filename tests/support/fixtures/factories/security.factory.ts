import { faker } from "@faker-js/faker";

export const createSecurityEvent = (overrides = {}) => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement([
    "SSH_COMMAND",
    "FILE_ACCESS",
    "CONFIG_CHANGE",
    "AUTH_FAILURE",
  ]),
  timestamp: new Date().toISOString(),
  severity: faker.helpers.arrayElement(["INFO", "WARNING", "CRITICAL"]),
  details: {
    user: faker.internet.username(),
    ip: faker.internet.ip(),
    message: faker.lorem.sentence(),
    ...overrides,
  },
  acknowledged: false,
});

export const createSecurityEvents = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createSecurityEvent(overrides));
