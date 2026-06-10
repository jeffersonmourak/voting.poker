import type { User } from "./machine/context";

export function makeUser(id: string, overrides: Partial<User> = {}): User {
  return {
    id,
    name: `user-${id}`,
    emoji: "🙈",
    avatar: "",
    moderator: false,
    vote: null,
    ...overrides,
  };
}
