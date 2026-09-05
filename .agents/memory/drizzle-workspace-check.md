---
name: Drizzle workspace checks
description: Environment-specific behavior when validating the PostgreSQL schema and generated migration.
---

The development database schema can be applied successfully with the workspace's existing Drizzle push workflow. The standalone `drizzle-kit check` command currently rejects the same config in this environment, so use the successful push plus migration output and database inspection as the validation signal unless the CLI setup changes.

**Why:** The configured PostgreSQL URL is accepted by `push` and the API runtime, but `check` reports an unrelated AWS Data API parameter error or rejects combining its flags with the config.

**How to apply:** Do not treat this `check` CLI failure alone as an application or migration failure; verify the generated SQL, run the normal push, and query the resulting schema when needed.