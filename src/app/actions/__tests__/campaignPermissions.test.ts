import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock, type DbMock } from "./helpers/drizzleMock";

vi.mock("@/db", () => ({ default: {} }));
vi.mock("../../../../auth", () => ({ auth: vi.fn() }));

import db from "@/db";
import { auth } from "../../../../auth";
import {
  isCampaignGM,
  isCampaignOwner,
  isCampaignOwnerOrGM,
  userHasAccessToCampaign,
} from "../campaignPermissions";

let mockDb: DbMock;

beforeEach(() => {
  vi.resetAllMocks();
  mockDb = createDbMock();
  Object.assign(db, mockDb);
});

const fakeSession = { user: { id: "user-1" } };

describe("userHasAccessToCampaign", () => {
  it("returns false when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await userHasAccessToCampaign("camp-1")).toBe(false);
  });

  it("returns true when authenticated (current stub behavior)", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    expect(await userHasAccessToCampaign("camp-1")).toBe(true);
  });
});

describe("isCampaignOwner", () => {
  it("returns false when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await isCampaignOwner("camp-1")).toBe(false);
  });

  it("returns true when the session user is the creator", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ creatorId: "user-1" });
    expect(await isCampaignOwner("camp-1")).toBe(true);
  });

  it("returns false when the session user is NOT the creator", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ creatorId: "other-user" });
    expect(await isCampaignOwner("camp-1")).toBe(false);
  });

  it("returns false when campaign is not found", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue(undefined);
    expect(await isCampaignOwner("camp-1")).toBe(false);
  });
});

describe("isCampaignGM", () => {
  it("returns false when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await isCampaignGM("camp-1")).toBe(false);
  });

  it("returns true when the session user is the DM", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ dmId: "user-1" });
    expect(await isCampaignGM("camp-1")).toBe(true);
  });

  it("returns false when the session user is NOT the DM", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ dmId: "other-user" });
    expect(await isCampaignGM("camp-1")).toBe(false);
  });

  it("returns false when campaign is not found", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue(undefined);
    expect(await isCampaignGM("camp-1")).toBe(false);
  });
});

describe("isCampaignOwnerOrGM", () => {
  it("returns false when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await isCampaignOwnerOrGM("camp-1")).toBe(false);
  });

  it("returns true when session user is the creator", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ creatorId: "user-1", dmId: "other-user" });
    expect(await isCampaignOwnerOrGM("camp-1")).toBe(true);
  });

  it("returns true when session user is the DM", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ creatorId: "other-user", dmId: "user-1" });
    expect(await isCampaignOwnerOrGM("camp-1")).toBe(true);
  });

  it("returns false when session user is neither creator nor DM", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue({ creatorId: "creator", dmId: "dm" });
    expect(await isCampaignOwnerOrGM("camp-1")).toBe(false);
  });

  it("returns false when campaign is not found", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaigns.findFirst.mockResolvedValue(undefined);
    expect(await isCampaignOwnerOrGM("camp-1")).toBe(false);
  });
});
