# GitHub Security and PR Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect `main` so only Josep can bypass PR, review, and check requirements; require useful, complete PR descriptions; run automated quality/security checks; and label PRs by the affected CareerKit section.

**Architecture:** Keep local quality checks in pnpm scripts and run the same checks in a read-only GitHub Actions workflow. Use a base-branch `pull_request_target` workflow only for trusted metadata operations (description/path validation and label assignment), never check out or execute PR code, and explicitly scope its Actions event policy to that workflow. Apply a repository ruleset with a user-specific bypass for Josep.

**Tech Stack:** pnpm 12, Prettier, GitHub Actions, GitHub repository rulesets, Dependabot, CodeQL, `actions/labeler`.

---

### Task 1: Add repository formatting commands

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.prettierignore`

- [x] Add Prettier as a development dependency and define `format` and `format:check` scripts over source, scripts, schemas, templates, package files, and GitHub YAML.
- [x] Set formatting options to preserve the existing no-semicolon and single-quote JavaScript style.
- [x] Run `pnpm format` and inspect the resulting diff for unrelated or personal data.

### Task 2: Add CI and security scanning

**Files:**
- Create: `.github/workflows/quality.yml`
- Create: `.github/workflows/codeql.yml`
- Create: `.github/dependabot.yml`

- [x] Run the locked dependency install, formatting check, production build, and publication-safety check for PRs and pushes to `main` with read-only permissions.
- [x] Add CodeQL scanning for JavaScript/TypeScript on pushes, pull requests, and a weekly schedule; do not upload fork results when GitHub withholds write permission.
- [x] Configure Dependabot for npm dependency alerts and updates without allowing automated PRs to change `.github/`.

### Task 3: Add PR ownership, labels, and description requirements

**Files:**
- Create: `.github/CODEOWNERS`
- Create: `.github/labeler.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/workflows/pr-guardrails.yml`

- [x] Assign all files, including `.github/`, to `@Josep-Martinez` in CODEOWNERS.
- [x] Configure uppercase labels `INICIO`, `PERFIL`, `CV`, `LINKEDIN`, `VACANTES`, and `BUZÓN` based on the now-separated page and data paths.
- [x] Validate that non-owner PRs have non-empty sections for changes, reason, verification, and risks, and fail the policy check when they change `.github/`.
- [x] Apply path labels using the pinned labeler action with least-privilege permissions; do not check out PR code in this workflow.
- [x] Make the guardrails aggregate check fail if policy validation or labeling fails.

### Task 4: Apply GitHub repository protections

**GitHub settings:** `Josep-Martinez/CareerKit`

- [x] Create a `main` ruleset that requires PRs, one code-owner approval, stale review dismissal, resolved review threads, the `quality` and `pr-guardrails` checks, no deletion, and no force pushes.
- [x] Grant ruleset bypass only to GitHub user ID `58307274` (`Josep-Martinez`).
- [x] Set the Actions default token permission to read-only and allow `pull_request_target` only for `.github/workflows/pr-guardrails.yml` so the safe labeling workflow continues to run after GitHub's scheduled default-policy enforcement.
- [x] Enable Dependabot alerts and security updates; verify secret scanning and push protection remain enabled.
- [x] Create the six uppercase section labels.

### Task 5: Verify and report

**Files:** All files above.

- [x] Run `pnpm format`, `pnpm format:check`, `pnpm build`, and `pnpm check:publish`.
- [x] Validate YAML and workflow action references; inspect the final diff and repository settings.
- [x] Leave all changes uncommitted and unpushed for the user to review.
