import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Only Route Handlers under app/api/** and backend infra under lib/auth/**
    // may talk to Prisma directly. Pages and components must go through the API (fetch).
    ignores: ["app/api/**", "lib/auth/**", "lib/db/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/db/prisma", "@/lib/db/*", "@prisma/client", "@/lib/generated/prisma*"],
              message:
                "Accès direct à Prisma interdit en dehors de app/api/**. Passe par l'API (lib/api-client.ts).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
