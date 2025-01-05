import Redis from "ioredis";

// Validate the Redis URL
if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error("Environment variable UPSTASH_REDIS_URL is not set.");
}

// Initialize Redis client
const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
    tls: {
        rejectUnauthorized: false, // Necessary for Upstash Redis
    },
});

export default redis;
