export interface PortalUser {
  id: string;
  name: string;
  username: string;
  role: "director" | "principal";

  schoolId?: string;
  schoolName?: string;
  udise?: string;
}

const SESSION_KEY = "kattipar_portal_session";

export function saveSession(user: PortalUser) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );
}

export function getSession(): PortalUser | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
      return null;
    }

    return JSON.parse(session) as PortalUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isDirector() {
  return getSession()?.role === "director";
}

export function isPrincipal() {
  return getSession()?.role === "principal";
}