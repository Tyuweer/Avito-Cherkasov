// src/app/hooks/stores/AuthStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { authApi } from '../../../shared/api/authApi';
import type { IUser } from '../../../shared/api/types';

const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_USER = 'auth_user';

export class AuthStore {
  user: IUser | null = null;
  token: string | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.restoreSession();
  }

  get isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  restoreSession(): void {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (storedToken && storedUser) {
        runInAction(() => {
          this.token = storedToken;
          this.user = JSON.parse(storedUser) as IUser;
        });
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      this.clearStorage();
    }
  }

  private saveToStorage(token: string, user: IUser): void {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  login = async (username: string, password: string): Promise<boolean> => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await authApi.login({ username, password });

      runInAction(() => {
        this.token = response.data.token;
        this.user = response.data.user;
        this.saveToStorage(response.data.token, response.data.user);
        this.isLoading = false;
      });

      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Login failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  register = async (username: string, password: string, email: string): Promise<boolean> => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await authApi.register({ username, password, email });

      runInAction(() => {
        this.token = response.data.token;
        this.user = response.data.user;
        this.saveToStorage(response.data.token, response.data.user);
        this.isLoading = false;
      });

      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Registration failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  logout = (): void => {
    runInAction(() => {
      this.user = null;
      this.token = null;
      this.error = null;
    });
    this.clearStorage();
  };

  clearError = (): void => {
    runInAction(() => {
      this.error = null;
    });
  };
}

export const authStore = new AuthStore();