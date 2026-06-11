export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'API responded with an error');
  }
  return json.data;
};

export const updateModule = async (moduleId: string, data: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${moduleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.detail || 'Failed to update module');
  }
  return json;
};
