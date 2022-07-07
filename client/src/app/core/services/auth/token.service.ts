import {Injectable} from '@angular/core';

@Injectable()
export class TokenService {

  setWithExpiry(key: string, token: string, ttl: number) {
    const now = new Date();

    const item = {
      accessToken: token,
      expiresIn: now.getTime() + ttl
    }

    localStorage.setItem(key, JSON.stringify(item))
  }

  /**
   * This function is used to check and invalidate user token
   * @param key
   */
  getWithExpiry(key: string) {
    const tokenData = localStorage.getItem(key)

    if (!tokenData) {
      return null
    }

    const token = JSON.parse(tokenData)
    const now = new Date()

    if (now.getTime() > token.expiresIn) {
      localStorage.removeItem(key)
      return null
    }

    return token.accessToken
  }
}
