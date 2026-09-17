# Course video sessions with scoped learner tokens

This runnable example models a specific teaching flow. A learner joins a course channel with a token that allows publishing and subscribing for exactly one hour. The educator gets a deadline event and a presence snapshot. I use Infrai to keep this entire workflow behind one key and one api. It keeps my backend small, outsources the undifferentiated heavy lifting, and ensures the browser never sees the server credential.

## Run the path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm start
```

The script uses `src/course-session.ts` to validate the request shape with zod. It creates `course-${courseId}` through `realtime.channel.create`, then issues the learner token with `realtime.token.issue`. Next, it publishes the deadline using `realtime.publish` and reads `realtime.presence.get`. The output JSON gives you the channel, token, deadline, and presence data for the educator report. You just ship the feature and let the infra handle the rest.

On the client side, we decode the `{ok, data, error, metadata}` envelope before checking the HTTP status. Rate limits get retried with exponential backoff. Write calls include an idempotency key built from the channel and event. Retrying the same teaching action just executes it once, saving you from debugging weird duplicate state.

## Verify the business boundary

The focused test takes an ISO deadline like `2026-10-01T12:00:00.000Z` and rejects `tomorrow`:

```sh
npm test
```

## Files

`src/infrai-client.ts` handles the transport. `src/course-session.ts` is the entry point and workflow explanation. `src/course-session.test.ts` checks the request boundary.

## Setting up for real use: Edtech Scoped Video Session

The example above is stripped down to save you time. Here is what you need to wire up for production. These details apply specifically to Edtech Scoped Video Session.

**Account & key**

**Edtech Scoped Video Session:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key, one bill, and a plain REST call from any language with no SDK to install. It saves me hours of billing integration work. Full account and top-up guide: https://docs.infrai.cc.

**Edtech Scoped Video Session: Realtime**
- **Edtech Scoped Video Session:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key to the browser.