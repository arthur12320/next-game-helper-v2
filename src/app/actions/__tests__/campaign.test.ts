import { beforeEach, describe, expect, it, vi } from "vitest";
import { chainable, createDbMock, type DbMock } from "./helpers/drizzleMock";

vi.mock("@/db", () => ({ default: {} }));
vi.mock("../../../../auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../campaignPermissions", () => ({
  userHasAccessToCampaign: vi.fn(),
}));

import db from "@/db";
import { auth } from "../../../../auth";
import { revalidatePath } from "next/cache";
import { userHasAccessToCampaign } from "../campaignPermissions";
import {
  createCampaign,
  deleteCampaign,
  editCampaign,
  fetchCampaign,
  fetchCampaigns,
} from "../campaign";

let mockDb: DbMock;

beforeEach(() => {
  vi.resetAllMocks();
  mockDb = createDbMock();
  Object.assign(db, mockDb);
});

const fakeSession = { user: { id: "user-1", name: "Alice" } };
const fakeCampaign = { id: "camp-1", name: "Epic Quest", description: "A journey", creatorId: "user-1", dmId: "user-1" };

describe("fetchCampaigns", () => {
  it("returns [] when no session exists", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const result = await fetchCampaigns();
    expect(result).toEqual([]);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it("calls db.select when authenticated and returns campaigns", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    mockDb.select.mockReturnValue(chainable([fakeCampaign]));
    const result = await fetchCampaigns();
    expect(mockDb.select).toHaveBeenCalledOnce();
    expect(result).toEqual([fakeCampaign]);
  });
});

describe("fetchCampaign", () => {
  it("returns null when user has no access", async () => {
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(false);
    const result = await fetchCampaign("camp-1");
    expect(result).toBeNull();
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it("returns the campaign when access is granted", async () => {
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(true);
    mockDb.select.mockReturnValue(chainable([fakeCampaign]));
    const result = await fetchCampaign("camp-1");
    expect(result).toEqual(fakeCampaign);
  });

  it("returns null when campaign does not exist", async () => {
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(true);
    mockDb.select.mockReturnValue(chainable([]));
    const result = await fetchCampaign("nonexistent");
    expect(result).toBeNull();
  });
});

describe("createCampaign", () => {
  it("throws Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(createCampaign("Name", "Desc")).rejects.toThrow("Unauthorized");
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("inserts a new campaign with session user as creatorId and dmId", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await createCampaign("New Campaign", "A description");
    expect(mockDb.insert).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/campaigns");
  });

  it("calls revalidatePath after successful creation", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await createCampaign("Campaign", "Desc");
    expect(revalidatePath).toHaveBeenCalledWith("/campaigns");
  });
});

describe("editCampaign", () => {
  it("throws Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(editCampaign("camp-1", { name: "New" })).rejects.toThrow("Unauthorized");
  });

  it("throws Access denied when user has no permission", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(false);
    await expect(editCampaign("camp-1", { name: "New" })).rejects.toThrow("Access denied");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("throws No valid fields to update when updates object is empty", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(true);
    await expect(editCampaign("camp-1", {})).rejects.toThrow("No valid fields to update");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("calls db.update and revalidatePath on valid name update", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(true);
    await editCampaign("camp-1", { name: "Renamed Campaign" });
    expect(mockDb.update).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/campaigns");
  });

  it("calls db.update and revalidatePath on valid description update", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    vi.mocked(userHasAccessToCampaign).mockResolvedValue(true);
    await editCampaign("camp-1", { description: "New description" });
    expect(mockDb.update).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/campaigns");
  });
});

describe("deleteCampaign", () => {
  it("throws Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(deleteCampaign("camp-1")).rejects.toThrow("Unauthorized");
    expect(mockDb.delete).not.toHaveBeenCalled();
  });

  it("calls db.delete when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await deleteCampaign("camp-1");
    expect(mockDb.delete).toHaveBeenCalledOnce();
  });

  it("calls revalidatePath after deletion", async () => {
    vi.mocked(auth).mockResolvedValue(fakeSession as never);
    await deleteCampaign("camp-1");
    expect(revalidatePath).toHaveBeenCalledWith("/campaigns");
  });
});
