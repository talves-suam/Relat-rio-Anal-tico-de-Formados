import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with UNISUAM domain hint and scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  hd: 'unisuam.edu.br',
  prompt: 'select_account',
});

export const ALLOWED_DOMAIN = 'unisuam.edu.br';

export function isAllowedDomain(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail.endsWith(`@${ALLOWED_DOMAIN}`);
}

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess: (user: User, token: string | null) => void,
  onAuthFailure: (reason?: string) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Check domain
      if (!isAllowedDomain(user.email)) {
        await signOut(auth);
        cachedAccessToken = null;
        onAuthFailure(`Acesso negado: o e-mail ${user.email || 'informado'} não pertence ao domínio institucional @${ALLOWED_DOMAIN}.`);
        return;
      }

      onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Strict Domain Enforcement
    if (!isAllowedDomain(user.email)) {
      const emailAttempted = user.email || 'desconhecido';
      await signOut(auth);
      cachedAccessToken = null;
      throw new Error(
        `Acesso restrito: Apenas usuários com e-mail institucional @${ALLOWED_DOMAIN} têm permissão. A tentativa com "${emailAttempted}" foi bloqueada.`
      );
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    return { user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Erro ao sair da conta:', error);
    throw error;
  }
};
