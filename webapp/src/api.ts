import type { AppContent, Mix, PublicUser, RatingSummary, RatingTargetType, UserRating } from './types';

const JSON_HEADERS = {
  'Content-Type': 'application/json'
};

export async function fetchContent(): Promise<AppContent> {
  const response = await fetch('/api/content');
  if (!response.ok) {
    throw new Error('Не удалось загрузить контент');
  }
  return response.json();
}

export async function ownerLogin(login: string, password: string): Promise<string> {
  const response = await fetch('/api/owner/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ login, password })
  });

  if (!response.ok) {
    throw new Error('Неверный логин или пароль');
  }

  const data = await response.json();
  return data.token as string;
}

export async function saveContent(token: string, content: AppContent): Promise<AppContent> {
  const response = await fetch('/api/owner/content', {
    method: 'PUT',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(content)
  });

  if (!response.ok) {
    throw new Error('Не удалось сохранить контент');
  }

  return response.json();
}

export type AuthResponse = {
  token: string;
  user: PublicUser;
  ratings: UserRating[];
};

export type RateResponse = {
  rating: UserRating;
  summary: RatingSummary;
};

export type CreateUserMixInput = {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  details: string;
  ingredients: string[];
  notes: string[];
};

async function readApiError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export async function registerUser(phone: string, nickname: string): Promise<AuthResponse> {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ phone, nickname })
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Не удалось войти'));
  }

  return response.json();
}

export async function fetchCurrentUser(token: string): Promise<Omit<AuthResponse, 'token'>> {
  const response = await fetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Сессия устарела'));
  }

  return response.json();
}

export async function rateTarget(token: string, targetType: RatingTargetType, targetId: string, value: number): Promise<RateResponse> {
  const response = await fetch('/api/users/ratings', {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ targetType, targetId, value })
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Не удалось сохранить оценку'));
  }

  return response.json();
}

export async function createUserMix(token: string, input: CreateUserMixInput): Promise<Mix> {
  const response = await fetch('/api/users/mixes', {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Не удалось добавить микс'));
  }

  const data = await response.json();
  return data.mix as Mix;
}
