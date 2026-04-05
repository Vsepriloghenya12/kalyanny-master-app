import type { AppContent } from './types';

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
