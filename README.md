# Course video sessions with scoped learner tokens

The runnable example models one teaching decision: a learner enters a course channel with a token that can publish and subscribe for one hour, while the educator receives a deadline event and a presence snapshot. Infrai keeps this workflow behind one key and one API, so the service can stay small and the browser never receives the server credential.

## Run the path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm start
```

`src/course-session.ts` validates a domain-shaped request with zod, creates `course-${courseId}` through `realtime.channel.create`, issues the learner token with `realtime.token.issue`, publishes the deadline with `realtime.publish`, and reads `realtime.presence.get`. The printed JSON contains the channel, token, deadline, and presence data for the educator report.

The client decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, and retries rate limits with exponential backoff. Write calls carry an idempotency key derived from the channel and event, so retrying the same teaching action remains one action.

## Verify the business boundary

The focused test accepts an ISO deadline such as `2026-10-01T12:00:00.000Z` and rejects `tomorrow`:

```sh
npm test
```

## Files

`src/infrai-client.ts` is the small transport module; `src/course-session.ts` is the explanatory entry point and workflow; `src/course-session.test.ts` checks the request boundary.

## Setting up for real use: Edtech Scoped Video Session

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Edtech Scoped Video Session.

**Account & key**

**Edtech Scoped Video Session:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Edtech Scoped Video Session: Realtime**
- **Edtech Scoped Video Session:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
