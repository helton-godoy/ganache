import { faker } from "@faker-js/faker";

export class UserFactory {
  private createdUsers: string[] = [];

  async createUser(overrides = {}) {
    const user = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };

    // Mock API call to create user - In a real app, you would fetch against the API
    // For this prototype, we'll just simulate the return
    /*
        const response = await fetch(`${process.env.API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        const created = await response.json();
        this.createdUsers.push(created.id);
        return created;
        */

    // Simulating creation for prototype
    const created = { ...user, id: faker.string.uuid() };
    this.createdUsers.push(created.id);
    return created;
  }

  async cleanup() {
    // Delete all created users
    for (const userId of this.createdUsers) {
      /*
            await fetch(`${process.env.API_URL}/users/${userId}`, {
              method: 'DELETE',
            });
            */
      console.log(`Cleaning up user ${userId}`);
    }
    this.createdUsers = [];
  }
}
