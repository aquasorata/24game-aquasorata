type BootstrapResult =
  | { ok: true; user: { id: string; username: string; elo: number } }
  | { ok: false; message: string };

export async function bootstrapUser(input: {
  username: string;
  password: string;
}): Promise<BootstrapResult> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/api/bootstrap`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (res.status === 409) {
    return {
      ok: false,
      message: `Username is already taken.`
    };
  }

  if (res.status === 500) {
    return {
      ok: false,
      message: `Something went wrong. Please try again later.`
    };
  }

  if (res.status === 400) {
    return {
      ok: false,
      message: `Please check your username and password and try again.`
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: `Server error (${res.status})`,
    };
  }

  const data = (await res.json()) as BootstrapResult;
  return data;
}