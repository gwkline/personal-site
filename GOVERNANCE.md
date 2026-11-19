# Tracker governance

How the GitHub issue tracker for gwkline/personal-site is run. The tracker is the planning backbone: roadmap, bugs, and chores all live here, and an agent PM (Hermes) grooms it so every issue is small, labeled, and carries acceptance criteria.

## Labels

Every issue carries a kind and a priority. Add the area label that names the surface the work touches; a cross-cutting issue may carry no area.

| Axis | Labels | Meaning |
| --- | --- | --- |
| Kind | `kind:product` `kind:bug` `kind:chore` `kind:infra` `kind:security` `kind:docs` `kind:audit` | What the issue is. New capabilities are `kind:product`; breakage is `kind:bug`; invisible maintenance is `kind:chore`; reviews that produce tracked findings are `kind:audit`. |
| Priority | `priority:P0` … `priority:P3` | P0 must be fixed before relying on the system, P1 is next up, P2 is a valuable follow-up, P3 is later or optional. |
| Area | `area:site` `area:gym-app` `area:content` | Where the work lands: the site shell, the workout tracker, or the writing and showcased work. |

Priority belongs to the roadmap, not to whoever filed the issue — the PM loop sets it, and a comment from Gavin overrides it.

## Filing issues

- Use a template: **Feature request**, **Bug report**, or **Ops / chore**. Acceptance criteria are required. An issue without a definition of done is a discussion, not work; it gets closed as `not planned` with a note.
- One issue per deliverable. When a request spans several separately shippable pieces, the grooming loop splits it and links the parts.
- Agents file issues with `gh issue create` carrying the same fields — the templates describe the shape, not just the web form.

## The agent PM loop

Hermes grooms this tracker on a schedule:

1. **Triage.** New issues get kind, area, and priority within a day of filing. Duplicates are closed with a link to the original.
2. **Shape.** Anything without acceptance criteria gets a proposed checklist as a comment; the author or Gavin accepts or edits it. Oversized issues are split.
3. **Roadmap.** Proposed work lands as `kind:product` issues. Gavin signals what is real by promoting a priority (P0/P1) or by commenting — silence means P3.
4. **Deliver.** Work reaches `main` only through pull requests; merging with `Closes #N` closes the issue. Nothing is pushed to `main` directly.
5. **Sweep.** Issues with no activity for six weeks get a nudge comment, then close as `not planned` unless someone claims them.
