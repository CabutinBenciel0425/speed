import { beforeEach, describe, expect, test, vi } from "vitest";
import { mailConstructor, sendEmail } from "../../../utils/sendEmail";
import { transporter } from "../../../config/transporter";

vi.mock("../../../config/transporter.js", () => ({
  transporter: {
    sendMail: vi.fn(),
  },
}));

describe("email verification to sign up user - nodeMailer", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetAllMocks();
  });
  test("should build an object with the email and code", () => {
    const email = "test@test.com";
    const token = "123456";

    expect(mailConstructor(email, token)).toEqual(
      expect.objectContaining({
        to: email,
        html: expect.stringContaining("123456"),
      }),
    );
  });

  test("should send email and token to user", async () => {
    vi.mocked(transporter.sendMail).mockResolvedValueOnce({
      messageId: "123",
    } as any);
    const result = await sendEmail("test@test.com", "123456");

    expect(result).toEqual({ messageId: "123" });

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@test.com",
        html: expect.stringContaining("123456"),
      }),
    );
  });

  test("should throw a custom error if nodemailer fails", async () => {
    vi.mocked(transporter.sendMail).mockRejectedValueOnce(
      new Error("SMTP Error"),
    );
    await expect(sendEmail("test@test.com", "123456")).rejects.toThrow(
      "SMTP Error",
    );
  });
});
