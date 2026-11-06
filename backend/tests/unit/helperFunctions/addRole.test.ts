import { beforeEach, describe, expect, test, vi } from "vitest";
import { addUserRole } from "../../../utils/addRole";
import User from "../../../models/user.model";

vi.mock("../../../models/user.model.js", () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
  },
}));

describe("Adding role to user", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });
  test("returns error if role is not valid", async () => {
    const userId = "userid123";
    const role = "not-valid-role";
    await expect(addUserRole(userId, role)).rejects.toThrow(
      `Invalid role: ${role}. Valid roles: Customer, Merchant, Driver, Admin`,
    );
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("updates and returns the user if the role is valid", async () => {
    const userId = "userid123";
    const role = "Merchant";
    const fakeUser = { _id: userId, role: "Driver" };
    vi.mocked(User.findByIdAndUpdate).mockResolvedValueOnce(fakeUser as any);
    const result = await addUserRole(userId, role);

    expect(result).toEqual(fakeUser);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { $addToSet: { role } },
      { new: true, runValidators: true },
    );
  });
});
