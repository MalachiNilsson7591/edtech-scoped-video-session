import { z } from "zod";
import { createInfraiClient } from "./infrai-client.ts";

export const sessionRequest = z.object({ courseId: z.string().min(1), learnerId: z.string().min(1), deadline: z.string().datetime(), educatorAccountId: z.string().min(1) });
export type SessionRequest = z.infer<typeof sessionRequest>;

export async function startCourseSession(input: unknown, client = createInfraiClient()) {
  const request = sessionRequest.parse(input);
  const channel = `course-${request.courseId}`;
  await client.realtime.channel.create({ channel, type: "video", vendor: "livekit" });
  const token = await client.realtime.token.issue({ client_id: request.learnerId, channels: [channel], capabilities: ["publish", "subscribe"], ttl_seconds: 3600 });
  await client.realtime.publish({ channel, event: "learner.deadline", data: { deadline: request.deadline }, account_id: request.educatorAccountId });
  const presence = await client.realtime.presence.get(channel);
  return { channel, token: token.token, deadline: request.deadline, presence };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await startCourseSession({ courseId: "algebra-101", learnerId: "learner-7", deadline: "2026-10-01T12:00:00.000Z", educatorAccountId: "educator-3" });
  console.log(JSON.stringify(result, null, 2));
}
