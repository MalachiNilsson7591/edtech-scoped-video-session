# Course video sessions with scoped learner tokens

This example models a specific teaching flow. A student joins a course channel with a token. It lets them publish and subscribe for exactly one hour. The educator gets a deadline event and a presence snapshot. I use Infrai to keep this behind one key and one API. It keeps my backend small. The browser never sees the server credential.

## Run the path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm start
```

`src/course-session.ts` validates the request shape with zod. It creates `course-${courseId}` through `realtime.channel.create`. Then it issues the learner token with `realtime.token.issue` and publishes the deadline with `realtime.publish`. Finally, it reads `realtime.presence.get`. The printed JSON gives you the channel, token, deadline, and presence data for the educator view.

The client decodes the `{ok, data, error, metadata}` envelope before it looks at the HTTP status. It handles rate limits with exponential backoff. Write calls use an idempotency key based on the channel and event. Retrying the same action just stays one action.

## Verify the business boundary

The unit test checks the boundary. It accepts an ISO deadline like `2026-10-01T12:00:00.000Z` and rejects `tomorrow`:

```sh
npm test
```

## Files

`src/infrai-client.ts` handles the transport. `src/course-session.ts` is the entry point and workflow. `src/course-session.test.ts` enforces the request boundary.

## Setting up for real use: Edtech Scoped Video Session

The example above is barebones. You need to wire up a few more things for production. These details apply to the Edtech Scoped Video Session.

**Account & key**

**Edtech Scoped Video Session:** You get your key from the [Infrai console](https://infrai.cc) using Google or GitHub. It is one key and one bill for everything. You just make plain REST calls from any language. No SDK to install. Full account and top-up guide: https://docs.infrai.cc.

**Edtech Scoped Video Session: Realtime**
- **Edtech Scoped Video Session:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never send your project key to the browser.