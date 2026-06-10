import type { CoreClient, User } from "@/core/CoreClient";
import { capture } from "@/features/analytics/analytics";
import type { PeerDiagnostics } from "./PeerManager";

type ParticipantDiagnostics = User & {
  /** "local" for this tab, otherwise the peer's transport ("p2p", "relay", …). */
  transport: PeerDiagnostics["transport"] | "local" | "unknown";
  hasVoted: boolean;
};

export type NerdPoking = {
  readonly roomId: string;
  readonly phase: string;
  readonly roomSize: number;
  readonly moderator: User | null;
  readonly me: User;
  readonly participants: ParticipantDiagnostics[];
  readonly votes: Record<string, string>;
  readonly connections: PeerDiagnostics[];
};

type NerdPokingHost = typeof globalThis & { nerdPoking?: NerdPoking };

// Someone opened the console and poked. Console exploration reads getters
// repeatedly, so report each property at most once per page load (module
// scope survives the StrictMode remount).
const pokedProperties = new Set<string>();

/**
 * Expose a live, read-only room inspector at `window.nerdPoking` for poking
 * around in the console. Every property is a getter over the current
 * CoreClient/PeerManager state, so reading it always reflects "now".
 * Returns a detach function.
 */
export function attachNerdPoking(
  client: CoreClient,
  selfId: string,
  connections: () => PeerDiagnostics[]
): () => void {
  const poked = (property: keyof NerdPoking) => {
    if (pokedProperties.has(property)) {
      return;
    }

    pokedProperties.add(property);
    capture("nerd_poking_used", {
      property,
      room_id: client.state.roomId,
      room_size: client.state.users.length,
    });
  };

  const inspector: NerdPoking = {
    get roomId() {
      poked("roomId");
      return client.state.roomId;
    },
    get phase() {
      poked("phase");
      return client.state.state;
    },
    get roomSize() {
      poked("roomSize");
      return client.state.users.length;
    },
    get moderator() {
      poked("moderator");
      return client.state.users.find((user) => user.moderator) ?? null;
    },
    get me() {
      poked("me");
      return client.state.currentUser;
    },
    get participants() {
      poked("participants");
      const { users, votes } = client.state;
      const peers = connections();

      return users.map((user) => ({
        ...user,
        transport:
          user.id === selfId
            ? ("local" as const)
            : (peers.find((peer) => peer.id === user.id)?.transport ??
              ("unknown" as const)),
        hasVoted: votes[user.id] !== undefined,
      }));
    },
    get votes() {
      poked("votes");
      return client.state.votes;
    },
    get connections() {
      poked("connections");
      return connections();
    },
  };

  (globalThis as NerdPokingHost).nerdPoking = inspector;

  return () => {
    delete (globalThis as NerdPokingHost).nerdPoking;
  };
}
