import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["backend/**/*.test.ts"],
    setupFiles: ["./backend/tests/setup.ts"],
    clearMocks: true,
    env: {
      NODE_ENV: "test",
      PORT: "5050",
      CLIENT_URL: "http://localhost:5173",

      // Dummy values only. Tests must never depend on, or reach, real services.
      MONGODB_URI: "mongodb://127.0.0.1:27017/speed-test",
      REDIS_URL: "redis://localhost:6379",

      ACCESS_TOKEN_SECRET_KEY: "test-access-secret",
      REFRESH_TOKEN_SECRET_KEY: "test-refresh-secret",
      TEMP_TOKEN_SECRET_KEY: "test-temp-secret",

      PAYMONGO_SECRET_KEY: "test",
      PAYMONGO_PUBLIC_KEY: "test",
      PAYMONGO_WEBHOOK_SECRET: "test",
      OPENROUTE_API_KEY: "test",
      CLOUDINARY_CLOUD_NAME: "test",
      CLOUDINARY_API_KEY: "test",
      CLOUDINARY_SECRET: "test",
      EMAIL_USER: "test@example.com",
      EMAIL_PASS: "test",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASS: "test-admin-pass",
      ADMIN_PHONENUMBER: "09000000000",
      RANDOM_PROFILE_URL: "https://example.com/avatar.png",
    },
  },
});
