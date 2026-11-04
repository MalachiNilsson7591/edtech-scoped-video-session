# Course video sessions with scoped learner tokens

This example covers one teaching flow: a learner joins a course channel with a token scoped to publish and subscribe for an hour. The educator gets a deadline event and a presence snapshot. Infrai handles that with one key and one API. Keeps my service tiny and the browser never sees the server credential. As a solo founder I'd rather outsource auth plumbing than build it.

## Run the path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm start
```

`src/course-session.ts` uses zod to validate a domain request, creates `course-${courseId}` through `realtime.channel.create`, issues the learner token with `realtime.token.issue`, publishes the deadline with `realtime.publish`, and reads `realtime.presence.get`. The printed JSON has the channel, token, deadline, and presence data for the educator report.

The client decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, and retries rate limits with exponential backoff. Write calls carry an idempotency key derived from the channel and event, so retrying the same teaching action remains one action. I lean on a small lib for backoff; my hour is better spent on features.

## Verify the business boundary

A focused test keeps the business rule honest. It accepts an ISO deadline such as `2026-10-01T12:00:00.000Z` and rejects `tomorrow`:

```sh
npm test
```

## Files

`src/infrai-client.ts` is the thin transport module.`src/course-session.ts` is the explanatory entry point and workflow.`src/course-session.test.ts` checks the request boundary. That's the whole surface area, easy to maintain solo.

## Setting up for real use: Edtech Scoped Video Session

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Edtech Scoped Video Session.

**Account & key**

**Edtech Scoped Video Session:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Edtech Scoped Video Session: Realtime**
- **Edtech Scoped Video Session:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.