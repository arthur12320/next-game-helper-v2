import { beforeEach, describe, expect, it, vi } from "vitest";
import { chainable, createDbMock, type DbMock } from "./helpers/drizzleMock";

vi.mock("@/db", () => ({ default: {} }));
vi.mock("../../../../auth", () => ({ auth: vi.fn() }));

import db from "@/db";
import { auth } from "../../../../auth";
import { abandonCampaign, fetchParticipatingCampaigns } from "../campaignPlayers";

let mockDb: DbMock;

beforeEach(() => {
  vi.resetAllMocks();
  mockDb = createDbMock();
  Object.assign(db, mockDb);
});

const fakeSession = { user: { id: "user-1" } };
const fakeCampaigns = [{ id: "camp-1", name: "Dragon's Lair" }];

describe("fetchParticipatingCampaigns", () => {
  it("returns [] when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const result = await fetchParticipatingCampaigns();
    expect(result).toEqual([]);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it("calls db.select and returns campaigns when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable(fakeCampaigns));
    const result = await fetchParticipatingCampaigns();
    expect(mockDb.select).toHaveBeenCalledOnce();
    expect(result).toEqual(fakeCampaigns);
  });
});

describe("abandonCampaign", () => {
  it("throws User not authenticated when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(abandonCampaign("camp-1")).rejects.toThrow("User not authenticated");
    expect(mockDb.delete).not.toHaveBeenCalled();
  });

  it("calls db.delete when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await abandonCampaign("camp-1");
    expect(mockDb.delete).toHaveBeenCalledOnce();
  });
});
