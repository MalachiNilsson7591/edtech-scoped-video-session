import assert from "node:assert/strict";
import { sessionRequest } from "./course-session.ts";

const valid = { courseId: "algebra-101", learnerId: "learner-7", deadline: "2026-10-01T12:00:00.000Z", educatorAccountId: "educator-3" };
assert.equal(sessionRequest.parse(valid).courseId, "algebra-101");
assert.throws(() => sessionRequest.parse({ ...valid, deadline: "tomorrow" }));
console.log("session request validation passes");
