import mongoose from 'mongoose';

const MONGODB_URI = process.env.CONNECTION_STRING!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
    /* eslint-disable no-var */
    var _mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}


let cached = global._mongoose;

if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;