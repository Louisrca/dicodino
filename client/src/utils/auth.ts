export function getToken(): string | null {
  return localStorage.getItem("dicodino_jwt");
}

export function setToken(token: string): void {
  localStorage.setItem("dicodino_jwt", token);
}

export function clearToken(): void {
  localStorage.removeItem("dicodino_jwt");
}

export function getTokenUsername(token: string): string | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload?.username ?? null;
  } catch {
    return null;
  }
}
