import { test as base } from "@playwright/test";
import { UserFactory } from "./factories/user-factory";
import { WizardFixture } from "./wizard-fixture";

type TestFixtures = {
  userFactory: UserFactory;
  authenticatedUser: { id: string; email: string; name: string };
  wizard: WizardFixture;
};

export const test = base.extend<TestFixtures>({
  userFactory: async ({}, use) => {
    const factory = new UserFactory();
    await use(factory);
    await factory.cleanup(); // Auto-cleanup
  },
  authenticatedUser: async ({ page, userFactory }, use) => {
    const user = await userFactory.createUser();
    // Assume auth logic here if needed
    await use(user);
  },
  wizard: async ({ page }, use) => {
    await use(new WizardFixture(page));
  },
});

export { expect } from "@playwright/test";
