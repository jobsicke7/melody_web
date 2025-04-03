
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * 기본 세션 타입에 추가 속성 확장
   */
  interface Session {
    user: {
      id?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
}
