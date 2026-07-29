import { AttemptLimiter } from "./attemptLimiter.js";

/** Login throttle: 10 failures per 15 minutes, per email + IP. */
export class LoginAttemptTracker extends AttemptLimiter {}
