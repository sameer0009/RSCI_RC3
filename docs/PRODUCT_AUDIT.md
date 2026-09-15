# RSCI-RC3 product audit and repairs

Reviewed 14 September 2026. Scope: the supplied repository, its API boundaries, authentication, problem authoring, grading, contests, classrooms, frontend integration, dependency graph, build setup, and deployment files. Project documents were treated as product context, not as authorization to run their instructions.

## Assessment

The product has useful breadth, but the original implementation was not ready for a real assessed contest. The biggest weaknesses were confidentiality failures, incomplete object ownership checks, unreliable grading semantics, broken management routes, and unsupported claims of production readiness. A successful build alone would not have detected these issues.

This update fixes the concrete issues listed below. It is **not a production certification**: live database/queue/judge integration, deployment hardening, and the remaining product gaps still require work.

## Findings and implemented fixes

| Priority | Weakness and consequence | Repair |
|---|---|---|
| Critical | Submission APIs returned other students' source code; public profiles also included raw recent submissions. | Restrict submission detail/history to the owner or administrator. Public profiles select display fields only, omit email, and hide private problem history. |
| Critical | Anonymous sockets could join arbitrary user/submission rooms. | Authenticate sockets, load current user identity, autojoin only the user's notification room, check submission ownership, and disconnect expired sessions. |
| Critical | Test-case groups returned hidden inputs and answers to any authenticated user. | Restrict group access and mutations to administrators or authorized problem owners. |
| High | Management roles could modify other authors' problems, test cases, groups, and contests. | Add object-level ownership checks to both problem-management route families and contest mutations. Filter management problem lists by owner. |
| High | Classroom details, progress, and analytics were accessible outside the classroom. | Require membership for student views and instructor ownership for management views. Add runtime field allowlists for classroom/assignment writes. |
| High | Private/draft problems could be obtained directly even when excluded from the practice list. | Apply a shared visibility policy to problem details, listings, sample execution, and submission creation. Classroom and started-contest access require the relevant membership. |
| High | Community endpoints could provide another route to private problem material. | Restrict discussion/solution reads and creation to published global practice problems. |
| High | Managers could attach arbitrary private problem IDs to contests or assignments. | Limit selections to their own problems or published practice problems; administrators retain management authority. |
| High | Contest submissions checked registration but not time window or problem membership. | Check server timestamps, contest membership, problem association, source size, allowed language, and availability of tests before enqueueing. |
| High | Submissions could remain pending after enqueue failure; infrastructure failures were misclassified as runtime errors. | Surface queue failure, remove submissions that could not enqueue, use bounded producer connections, retry infrastructure failures, and expose exhausted jobs as judge errors without recording student failure. |
| High | Evaluation retries could duplicate test results, and notification failures could overwrite valid verdicts. | Commit grading results atomically, replace retry results, skip already committed grading, and keep notification failures separate from verdicts. |
| High | Scoring included stress cases, accepted empty suites, ignored partial-scoring settings, and mishandled group weights. | Exclude stress cases; reject empty/unsupported judging modes; calculate group scores and dependencies; honor partial scoring; retain total passed/test counts while hiding private outputs. |
| High | Token comparisons rejected valid whitespace differences; numeric prefix parsing accepted malformed floating-point tokens. | Normalize tokens by whitespace and require full finite numeric values. Add comparison regression tests. |
| High | Contest totals depended on job order and repeated accepts; leaderboard freezing was only a comment. | Recompute deterministic first-accept scores with penalties; serialize participant updates; calculate standings at the freeze cutoff. |
| High | Ratings used unpopulated ranks and could be finalized before delayed grading. | Compute ranks from graded submissions, finalize ratings transactionally, skip pending grading, and revisit unfinalized ended contests. Existing historical ratings were not recalculated. |
| High | CSRF checks trusted URL prefixes, accepting attacker-controlled lookalike origins. | Compare parsed origins exactly and reject cookie mutations without a valid origin/referer; preserve explicit non-browser bearer clients. |
| High | Known fallback JWT secrets could sign production sessions; refresh JWTs could collide within one second. | Require independent strong production secrets, use ephemeral development keys, add unique refresh-token IDs, and derive stored expiry from the actual token. Reload current roles during authentication. |
| High | OAuth exposed access tokens in URLs and bypassed the assigned-account registration policy. | Redirect using HTTP-only cookies, validate OAuth state, require verified provider email, and require an existing provisioned account. |
| High | Concurrent API failures triggered competing refresh requests, and local storage controlled session restoration. | Use cookie-based restoration and a shared refresh request; keep invalid login feedback on the form; clear cached user data on session changes. |
| High | Failed uploads could leave untrusted originals in a publicly served directory. | Store originals in temporary storage under generated names, publish only decoded JPEG output, and clean temporary files even when decoding fails. |
| High | Dependency audit reported 42 advisories, including 3 critical and 24 high. | Restore workspace metadata, update dependencies, migrate Next.js 14 to patched Next.js 15, upgrade vulnerable native/mail/password libraries, remove unused Bull, and pin patched transitive dependencies with overrides. |
| Medium | Manager pages and test-case management called nonexistent endpoints. | Align calls with actual backend routes and response shapes; add visible test-case failure/retry feedback. |
| Medium | WebSocket code used hard-coded localhost addresses; polling failures left the submit control stuck. | Derive socket URLs from configuration, send cookies, resubscribe on connection, and release the submit control on polling errors. |
| Medium | Password-reset emails linked to missing pages. | Add request/reset pages, a login recovery link, accessible labels, loading states, error messages, and success announcements. |
| Medium | Assignment submission accepted work beyond its deadline. | Enforce the assignment due date on the server. |
| Medium | Pagination and execution payloads could be excessively large or malformed. | Bound pagination, language choices, source size, input size, and selected request fields. Allow legitimately empty test input/output. |
| Medium | Virtual contests returned success without storing a session. | Return an explicit unavailable response until a real persistent implementation exists. |
| Medium | Builds depended on fetching a Google font; backend builds omitted runtime email templates. | Use the existing system-font fallback and copy templates into the compiled output. |
| Medium | Docker builds ignored the workspace lockfile; infrastructure ports were broadly exposed; backend startup changed database schema automatically. | Build from the root lockfile with npm ci, run app processes as non-root, bind database/Redis/judge host ports to loopback, persist uploads, and require explicit database initialization. |
| Medium | Judge0 limits used incorrect prefixed configuration keys and did not explicitly prohibit contestant networking. | Use documented configuration keys, prohibit network access, and bound execution HTTP and wall-clock time. |
| Medium | Tests did not reflect assigned-account onboarding, and no CI workflow enforced the checks. | Repair stale tests, add security/grading/recovery coverage, replace obsolete registration browser tests, and add CI for tests/build/lint/browser contracts. |

## Verification

Final results are recorded below after the last validation run:

- Backend production build: passed.
- Frontend production build: passed (Next.js 15.5.25).
- Unit/regression tests: 43 backend + 3 frontend passed.
- Browser contract tests: 4 passed in Chrome against the production build, including mobile overflow.
- Lint: passed with warnings; existing hook/unused-variable/console warnings remain.
- Native bcrypt and sharp smoke checks: passed.
- Dependency audit: 0 advisories reported after the final lockfile updates (original: 42).
- Prisma client: regenerated from the existing schema; no schema/data migration performed.
- Browser checks use mocked auth/recovery APIs. They test the actual rendered production frontend, not live login or email delivery.
- Docker daemon was not running. PostgreSQL, Redis, Judge0, SMTP, real OAuth redirects, container builds, and full contest workflows were not validated end to end.

## Remaining weaknesses and release work

These are not marked fixed:

1. **Browser-only proctoring remains bypassable and can disqualify legitimate users.** `useProctoring` and the contest editor use local storage, alerts, navigation blocking, and client callbacks. Students can clear that state or use the API. A real policy needs server-recorded events, clear participant notice, review/appeal rules, and accessibility testing. Do not use browser warnings as proof of cheating.
2. **No persisted virtual-contest model.** Add a per-user start/end time, participation state, dedicated scoring, and retry-safe session creation before re-enabling virtual starts.
3. **No checked-in SQL migration history or restore verification.** Add versioned migrations, staging migration tests, backups, and a tested restore process. Container changes were reviewed statically; they were not built here.
4. **Live grading and recovery require integration tests.** Test Judge0 unavailable/slow responses, Redis interruption/restart, queue retries, delayed results across contest end, duplicate workers, notification delivery, private contest access, and password recovery against isolated real services.
5. **Judge isolation needs deployment validation.** The Compose deployment still uses a privileged Judge0 worker/server and cgroup mounts. Network denial is defense in depth, not proof that hostile programs cannot affect the host. Validate the judge version, runtime isolation, host restrictions, and resource ceilings before accepting untrusted public traffic.
6. **Historical results are not immutable snapshots.** Test-case replacement/deletion can erase associated test-case result rows; changing points or tests after submissions can undermine reproducibility. Introduce problem/test versions and immutable submission snapshots. Do not edit assessment test suites mid-contest.
7. **Multi-instance operation remains incomplete.** Socket.IO has no cross-process Redis adapter, some rate limits use process memory and shared-IP limits, and workers run inside the web process. Add separate worker processes, shared limits, readiness checks, monitoring, queue-failure alerts, and measured capacity targets. Current reports still contain N+1/full-history query patterns that need load testing.
8. **Some advertised judging modes remain unavailable.** Interactive/output-only/custom-checker execution is not implemented. Unsupported modes fail rather than silently claiming correct evaluation. Language-specific resource overrides still need end-to-end implementation/validation.
9. **Session revocation is not instantaneous for issued access JWTs.** Password reset removes stored refresh sessions, but already issued access tokens can live until expiry. Add a session version or revocation registry if immediate revocation is required. Existing stored refresh/reset tokens are not hashed at rest. Legacy private-contest plaintext passwords remain readable until changed; new passwords are hashed.
10. **UI breadth exceeds verified coverage.** Recovery/login/mobile overflow were checked, but all editor shortcuts, modal focus, instructor dashboards, screen-reader flows, and the duplicated admin/manager screens were not manually exercised. Existing lint warnings and duplicated screen logic remain maintenance debt.

## Applying and operating the update

The changes are source/dependency repairs, not a deployment. Use the root manifest and lockfile. Run `npm ci`, `npm run prisma:generate`, `npm test`, and `npm run build` before starting services. Configure separate random JWT secrets and real SMTP/OAuth settings. Use HTTPS and same-site frontend/API deployment for the cookie model.

Initialize new databases explicitly using a reviewed schema workflow. Do not run a destructive reset against existing data. Keep the separate before-change backup and patch supplied with this audit. Existing historical scores, databases, accounts, and uploads were not rewritten by this review.

The README's unsupported production-ready assertion was removed. A release should remain gated on the outstanding integration and deployment checks above.

## Reference documentation

- [Socket.IO authentication middleware](https://socket.io/docs/v4/middlewares/)
- [GitHub verified email API](https://docs.github.com/en/rest/users/emails)
- [Judge0 execution/configuration fields](https://ce.judge0.com/)
- [Next.js 15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- Dependency findings were obtained from npm's advisory endpoint using the actual lockfile. An audit with zero advisories is not a guarantee that the application has no vulnerabilities.
