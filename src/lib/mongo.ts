import { MongoClient, ServerApiVersion } from 'mongodb'; // Ensure MongoClient is imported as a type
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGO_URI;

// MongoDB 클라이언트 옵션
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: InstanceType<typeof MongoClient>;
let clientPromise: Promise<InstanceType<typeof MongoClient>>;

declare global {
  var _mongoClientPromise: Promise<InstanceType<typeof MongoClient>> | undefined;
  var _mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise as Promise<InstanceType<typeof MongoClient>>;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose 연결 캐싱
if (!global._mongooseConnection) {
  global._mongooseConnection = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (global._mongooseConnection.conn) {
    return global._mongooseConnection.conn;
  }

  if (!global._mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
    };

    global._mongooseConnection.promise = mongoose.connect(uri, opts);
  }

  try {
    await global._mongooseConnection.promise;
    global._mongooseConnection.conn = mongoose.connection;
  } catch (e) {
    global._mongooseConnection.promise = null;
    throw e;
  }

  return mongoose.connection;
}

// Explicitly declare the type of the clientPromise
export { clientPromise };
export default connectDB;
