import { Item } from '../types';

export async function getHealthStatus(): Promise<{ success: boolean; status: string; totalItems: number }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchItems(params?: {
  status?: string;
  category?: string;
  search?: string;
  userId?: string;
}): Promise<Item[]> {
  const url = new URL('/api/items', window.location.origin);
  if (params?.status && params.status !== 'All') {
    url.searchParams.set('status', params.status);
  }
  if (params?.category && params.category !== 'All') {
    url.searchParams.set('category', params.category);
  }
  if (params?.search) {
    url.searchParams.set('search', params.search);
  }
  if (params?.userId) {
    url.searchParams.set('userId', params.userId);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to load items: ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function fetchItemById(id: string): Promise<Item> {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) {
    throw new Error('Item not found');
  }
  const data = await res.json();
  return data.item;
}

export async function createItem(
  item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>,
  token?: string
): Promise<Item> {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(item),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to report item');
  }
  return data.item;
}

export async function updateItem(
  id: string,
  updates: Partial<Item>,
  token?: string
): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update item');
  }
  return data.item;
}

export async function deleteItem(id: string, token?: string): Promise<boolean> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete item');
  }
  return true;
}
