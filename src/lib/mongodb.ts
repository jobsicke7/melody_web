import { MongoClient } from 'mongodb';

// MongoDB URI에서 사용자 이름, 비밀번호 등을 환경변수로 처리하는 것이 좋습니다.
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not defined.");
}

const client = new MongoClient(uri);

// 클라이언트 연결을 완료하고 db에 접근
export const clientPromise = client.connect().then(() => client);  // 클라이언트 연결 후 client 반환

export const getDb = async () => {
  const client = await clientPromise;  // 연결이 완료된 후 client를 사용
  const db = client.db("discord_music_bot");
  return db;
};

export const getQueueCollection = async () => {
  const db = await getDb();
  return db.collection("music_queue");
};

export const getPlayingCollection = async () => {
  const db = await getDb();
  return db.collection("now_playing");
};

export const getdocs = async () => {
  const db = await getDb();
  return db.collection("docs");
};

export const getNoticesCollection = async () => {
  const db = await getDb();
  return db.collection("noticelist");
};