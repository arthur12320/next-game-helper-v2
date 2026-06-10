import { beforeEach, describe, expect, it, vi } from "vitest";
import { chainable, createDbMock, type DbMock } from "./helpers/drizzleMock";

vi.mock("@/db", () => ({ default: {} }));
vi.mock("../../../../auth", () => ({ auth: vi.fn() }));
vi.mock("../notifications", () => ({ addNotification: vi.fn() }));

import db from "@/db";
import { auth } from "../../../../auth";
import { addNotification } from "../notifications";
import {
  acceptInvite,
  getPendingInvites,
  rejectInvite,
  sendInvite,
} from "../campaignInvites";

let mockDb: DbMock;

beforeEach(() => {
  vi.resetAllMocks();
  mockDb = createDbMock();
  Object.assign(db, mockDb);
});

const fakeSession = { user: { id: "user-1", name: "Alice" } };

describe("sendInvite", () => {
  it("throws User not authenticated when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(sendInvite({ campaignId: "camp-1", userEmail: "bob@test.com" })).rejects.toThrow(
      "User not authenticated"
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("throws User not found when email does not exist in the database", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([]));
    await expect(sendInvite({ campaignId: "camp-1", userEmail: "nobody@test.com" })).rejects.toThrow(
      "User not found"
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("inserts an invite and calls addNotification on success", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([{ id: "user-2", name: "Bob", email: "bob@test.com" }]));
    await sendInvite({ campaignId: "camp-1", userEmail: "bob@test.com" });
    expect(mockDb.insert).toHaveBeenCalledOnce();
    expect(addNotification).toHaveBeenCalledOnce();
  });
});

describe("acceptInvite", () => {
  it("throws User not authenticated when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(acceptInvite("invite-1")).rejects.toThrow("User not authenticated");
  });

  it("throws Invite not found when invite does not exist", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([]));
    await expect(acceptInvite("invite-1")).rejects.toThrow("Invite not found");
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("inserts player, updates invite status, and sends notifications to creator and DM", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([{ id: "invite-1", campaignId: "camp-1" }]));
    mockDb.query.campaigns.findFirst.mockResolvedValue({
      id: "camp-1",
      name: "Epic Campaign",
      creator: { email: "creator@test.com" },
      dm: { email: "dm@test.com" },
    });

    await acceptInvite("invite-1");

    expect(mockDb.insert).toHaveBeenCalledOnce();
    expect(mockDb.update).toHaveBeenCalledOnce();
    expect(addNotification).toHaveBeenCalledTimes(2);
  });

  it("sends only one notification when creator and DM are the same person", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([{ id: "invite-1", campaignId: "camp-1" }]));
    mockDb.query.campaigns.findFirst.mockResolvedValue({
      id: "camp-1",
      name: "Solo Campaign",
      creator: { email: "creator@test.com" },
      dm: { email: "creator@test.com" },
    });

    await acceptInvite("invite-1");

    expect(addNotification).toHaveBeenCalledTimes(2);
  });

  it("does not send notification when campaign is not found", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([{ id: "invite-1", campaignId: "camp-1" }]));
    mockDb.query.campaigns.findFirst.mockResolvedValue(undefined);

    await acceptInvite("invite-1");

    expect(mockDb.insert).toHaveBeenCalledOnce();
    expect(mockDb.update).toHaveBeenCalledOnce();
    expect(addNotification).not.toHaveBeenCalled();
  });
});

describe("rejectInvite", () => {
  it("throws User not authenticated when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(rejectInvite("invite-1")).rejects.toThrow("User not authenticated");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("calls db.update with status rejected when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await rejectInvite("invite-1");
    expect(mockDb.update).toHaveBeenCalledOnce();
  });
});

describe("getPendingInvites", () => {
  it("throws User not authenticated when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(getPendingInvites()).rejects.toThrow("User not authenticated");
  });

  it("returns pending invites with campaign data for the logged-in user", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    const fakeInvites = [{ id: "invite-1", status: "pending", campaign: { id: "camp-1", name: "Test" } }];
    mockDb.query.campaignInvites.findMany.mockResolvedValue(fakeInvites);

    const result = await getPendingInvites();
    expect(result).toEqual(fakeInvites);
    expect(mockDb.query.campaignInvites.findMany).toHaveBeenCalledOnce();
  });

  it("returns empty array when user has no pending invites", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.query.campaignInvites.findMany.mockResolvedValue([]);
    const result = await getPendingInvites();
    expect(result).toEqual([]);
  });
});
