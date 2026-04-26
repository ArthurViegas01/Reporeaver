## What

<!-- 1-2 sentence summary of the change. -->

## Why

<!-- Link to issue / context. What problem does this solve? -->

## How

<!-- Approach + key trade-offs. -->

## Checklist

- [ ] Backend tests pass (`make test`)
- [ ] Frontend typecheck passes (`npm run typecheck`)
- [ ] If touching /terraform: `terraform fmt -recursive` ran
- [ ] No secrets in diff (run `git diff --cached | grep -iE 'token|key|secret'`)
- [ ] Updated docs / `.env.example` if env vars changed
