import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, ".env.local") });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});
