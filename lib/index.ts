import axios, { AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';

const ENVIRONMENTS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  SANDBOX: 'sandbox',
};

const BASE_URLS = {
  PRODUCTION: 'https://api.console.eyowo.com',
  STAGING: 'http://52.6.208.160:9193',
  SANDBOX: 'https://api.sandbox.developer.eyowo.com',
};

const FACTORS = { SMS: 'sms' };

export class Client {
  private environment: string;

  private appKey: string;

  private appSecret: string;

  private axiosInstance: AxiosInstance;

  constructor({ appKey, appSecret, environment }: IClientConstructor) {
    if (!appKey) {
      throw new Error('App key is required');
    }
    if (!appSecret) {
      throw new Error('App secret is required');
    }
    if (environment && !Object.values(ENVIRONMENTS).includes(environment)) {
      throw new Error('Invalid environment');
    }

    this.environment = environment || ENVIRONMENTS.PRODUCTION;
    this.appKey = appKey;
    this.appSecret = appSecret;

    let baseURL = BASE_URLS.PRODUCTION;
    switch (environment) {
      case ENVIRONMENTS.PRODUCTION:
        baseURL = BASE_URLS.PRODUCTION;
        break;
      case ENVIRONMENTS.SANDBOX:
        baseURL = BASE_URLS.SANDBOX;
        break;
      case ENVIRONMENTS.STAGING:
        baseURL = BASE_URLS.STAGING;
        break;
    }

    this.axiosInstance = axios.create({ baseURL });
  }

  generateAuthData({ message }: { message: string }) {
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    return {
      authData: CryptoJS.AES.encrypt(message, CryptoJS.enc.Base64.parse(this.appSecret), {
        iv: CryptoJS.enc.Base64.parse(iv),
      }).toString(),
      iv,
    };
  }

  Auth = {
    validateUser: async ({ mobile }: { mobile: string }) => {
      const { authData, iv } = this.generateAuthData({
        message: JSON.stringify({ mobile }),
      });

      try {
        const req = await this.axiosInstance.post(
          '/v1/users/auth/validate',
          { authData },
          { headers: { 'X-App-Key': this.appKey, 'X-IV': iv } },
        );
        return req.data;
      } catch (error) {
        if (error.response) return error.response.data;
        throw error;
      }
    },
    authenticateUser: async ({ mobile, factor, passcode }: IAuthenticateUser) => {
      if (!Object.values(FACTORS).includes(factor)) {
        throw new Error('Invalid authentication factor');
      }

      const { authData, iv } = this.generateAuthData({
        message: JSON.stringify({ mobile, factor, passcode }),
      });

      try {
        const req = await this.axiosInstance.post(
          '/v1/users/auth',
          { authData },
          { headers: { 'X-App-Key': this.appKey, 'X-IV': iv } },
        );
        return req.data;
      } catch (error) {
        if (error.response) return error.response.data;
        throw error;
      }
    },
  };

  Users = {
    getBalance: async ({ mobile, accessToken }: { mobile: string; accessToken: string }) => {
      const { authData, iv } = this.generateAuthData({
        message: JSON.stringify({ mobile }),
      });

      try {
        const req = await this.axiosInstance.post(
          '/v1/users/balance',
          { authData },
          {
            headers: {
              'X-App-Key': this.appKey,
              'X-IV': iv,
              'X-App-Wallet-Access-Token': accessToken,
            },
            params: { authData },
          },
        );
        return req.data;
      } catch (error) {
        if (error.response) return error.response.data;
        throw error;
      }
    },
    transferToPhone: async ({
      mobile,
      amount,
      accessToken,
    }: {
    mobile: string;
    amount: number;
    accessToken: string;
    }) => {
      const { authData, iv } = this.generateAuthData({
        message: JSON.stringify({ mobile, amount }),
      });

      try {
        const req = await this.axiosInstance.post(
          '/v1/users/transfers/phone',
          { authData },
          {
            headers: {
              'X-App-Key': this.appKey,
              'X-IV': iv,
              'X-App-Wallet-Access-Token': accessToken,
            },
          },
        );
        return req.data;
      } catch (error) {
        if (error.response) return error.response.data;
        throw error;
      }
    },
  };
}

interface IClientConstructor {
  appKey: string;
  appSecret: string;
  environment?: string;
}

interface IAuthenticateUser {
  mobile: string;
  factor: string;
  passcode?: string;
}
