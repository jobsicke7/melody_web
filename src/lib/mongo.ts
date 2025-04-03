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
  // 개발 환경에서는 연결을 재사용
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
  // 프로덕션 환경에서는 새로운 연결 생성
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
    // 기존 연결이 있다면 재사용
    if (global._mongooseConnection.conn) {
      return global._mongooseConnection.conn;
    }

    // 연결 시도 중이라면 기존 Promise 재사용
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

    // 연결 이벤트 리스너 설정
    mongoose.connection.on('connected', () => {
      console.log('Mongoose가 MongoDB에 연결되었습니다.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 연결 오류:', err);
    });

    return connection;
  } catch (error) {
    global._mongooseConnection.promise = null;
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

export { clientPromise };
export default connectDB;