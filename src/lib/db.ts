import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vasantham';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

/**
 * Runs a database query for a page that Next.js prerenders at build time.
 *
 * If the database can't be reached while the site is being built (for example
 * MONGODB_URI isn't available to the build yet), the page is rendered with
 * `fallback` instead of failing the whole deploy. Because these pages use ISR,
 * the real data replaces the fallback on the first revalidation after deploy.
 * Outside the build the error is rethrown, so a request-time failure keeps the
 * previously cached page instead of caching placeholder content.
 */
export async function queryWithBuildFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: NoInfer<T>
): Promise<T> {
  try {
    await connectDB();
    return await query();
  } catch (error) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error;
    console.warn(
      `[${label}] Database unavailable during build; prerendering with default content. ` +
        'Check that MONGODB_URI is set for builds.',
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}
