import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI 환경변수가 정의되지 않았습니다.');
}

const uri = process.env.MONGODB_URI as string;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongooseConnection: MongooseConnection;
}

let clientPromise: Promise<MongoClient>;

// MongoDB 클라이언트 연결 관리
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(error => {
        console.error('MongoDB 연결 실패:', error);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose 연결 관리
if (!global._mongooseConnection) {
  global._mongooseConnection = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  try {
    if (global._mongooseConnection.conn) {
      return global._mongooseConnection.conn;
    }

    if (!global._mongooseConnection.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      global._mongooseConnection.promise = mongoose.connect(uri, opts);
    }

    const connection = await global._mongooseConnection.promise;
    global._mongooseConnection.conn = connection;

    mongoose.connection.on('connected', () => {
      console.log('Mongoose가 MongoDB에 연결되었습니다.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose 연결이 종료되었습니다.');
    });

    return connection;
  } catch (error) {
    console.error('MongoDB 연결 중 오류 발생:', error);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    global._mongooseConnection.conn = null;
    global._mongooseConnection.promise = null;
  } catch (error) {
    console.error('MongoDB 연결 종료 중 오류 발생:', error);
    throw error;
  }
}

export { clientPromise, connectDB, disconnectDB };