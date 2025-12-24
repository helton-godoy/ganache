/**
 * User Factory
 * 
 * Generates test user data using @faker-js/faker for deterministic randomness.
 * Avoids hardcoded test data and supports flexible overrides.
 * 
 * @ref Story-5.3 - Break-Glass Emergency Admin testing
 */

import { faker } from '@faker-js/faker';

/**
 * Test user interface matching backend user model
 */
export interface TestUser {
    username: string;
    password: string;
    email: string;
    role: 'admin' | 'user' | 'emergency_admin';
    fullName?: string;
}

/**
 * Create a test user with random data
 * 
 * @param overrides - Partial user data to override defaults
 * @returns TestUser with generated or overridden values
 * 
 * @example
 * ```typescript
 * const user = createUser({ username: 'specific-user' });
 * const admin = createUser({ role: 'admin' });
 * ```
 */
export const createUser = (overrides: Partial<TestUser> = {}): TestUser => ({
    username: faker.internet.username().toLowerCase(),
    password: faker.internet.password({ length: 16 }),
    email: faker.internet.email(),
    role: 'user',
    fullName: faker.person.fullName(),
    ...overrides,
});

/**
 * Create an admin user
 * 
 * @param overrides - Partial user data to override defaults
 * @returns TestUser with admin role
 */
export const createAdmin = (overrides: Partial<TestUser> = {}): TestUser =>
    createUser({
        role: 'admin',
        ...overrides,
    });

/**
 * Create emergency_admin user
 * 
 * @param overrides - Partial user data to override defaults
 * @returns TestUser with emergency_admin role
 */
export const createEmergencyAdmin = (
    overrides: Partial<TestUser> = {}
): TestUser =>
    createUser({
        username: 'emergency_admin',
        role: 'emergency_admin',
        ...overrides,
    });

/**
 * Generate a complex password meeting NIST requirements
 * (12+ chars, uppercase, lowercase, digit, symbol)
 * 
 * @returns Valid password string
 */
export const generateValidPassword = (): string => {
    const upper = faker.string.alpha({ length: 2, casing: 'upper' });
    const lower = faker.string.alpha({ length: 2, casing: 'lower' });
    const digits = faker.string.numeric(4);
    const symbols = faker.helpers.arrayElement(['!', '@', '#', '$', '%', '&', '*']);
    const extra = faker.string.alphanumeric(4);

    // Shuffle to avoid predictable patterns
    const combined = `${upper}${lower}${digits}${symbols}${extra}`;
    const shuffled = faker.helpers.shuffle(combined.split(''));
    return shuffled.join('');
};

/**
 * Generate an invalid password (for negative testing)
 * 
 * @param reason - Why the password is invalid
 * @returns Invalid password string
 */
export const generateInvalidPassword = (
    reason: 'too_short' | 'no_upper' | 'no_lower' | 'no_digit' | 'no_symbol'
): string => {
    switch (reason) {
        case 'too_short':
            return 'Short1!'; // Only 7 chars
        case 'no_upper':
            return 'nouppercase123!'; // Missing uppercase
        case 'no_lower':
            return 'NOLOWERCASE123!'; // Missing lowercase
        case 'no_digit':
            return 'NoDigitsHere!@#'; // Missing digit
        case 'no_symbol':
            return 'NoSymbols1234'; // Missing symbol
    }
};
