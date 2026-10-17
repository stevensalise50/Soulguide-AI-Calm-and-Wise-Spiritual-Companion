import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatMessage, JournalEntry, GoalItem, SavedPrayer, VoiceSettings } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Enable offline persistence in browser
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence is not supported by this browser');
      }
    });
  } catch (e) {
    // Ignore persistence errors
  }
}

// Ensure anonymous or persistent authentication with graceful local-mode fallback
export const initAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      callback(user);
      return;
    }

    // Check if anonymous auth is already known to be admin-restricted in this project
    const isAnonRestricted =
      typeof window !== 'undefined' &&
      (sessionStorage.getItem('firebase_anon_restricted') === 'true' ||
       localStorage.getItem('firebase_anon_restricted') === 'true');

    if (isAnonRestricted) {
      callback(null);
      return;
    }

    try {
      const cred = await signInAnonymously(auth);
      callback(cred.user);
    } catch (err: any) {
      // If anonymous auth is disabled on the project (auth/admin-restricted-operation),
      // mark it as restricted and silently continue in local-first mode without raising console errors.
      if (
        err?.code === 'auth/admin-restricted-operation' ||
        err?.code === 'auth/operation-not-allowed'
      ) {
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('firebase_anon_restricted', 'true');
            localStorage.setItem('firebase_anon_restricted', 'true');
          } catch {
            // Ignore storage errors
          }
        }
      }
      callback(null);
    }
  });
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err: any) {
    if (err?.code !== 'auth/popup-closed-by-user') {
      console.warn('Google sign-in notice:', err?.message || err);
    }
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.warn('Sign out notice:', err?.message || err);
  }
};

// ==========================================
// REAL-TIME FIRESTORE SYNC SERVICES
// ==========================================

export const syncService = {
  // Sync Chat Messages
  subscribeMessages(userId: string, onUpdate: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, `users/${userId}/messages`), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInitial: data.isInitial,
          bibleVerse: data.bibleVerse,
          lifeLesson: data.lifeLesson,
        });
      });
      onUpdate(msgs);
    }, (error) => {
      console.warn('Messages sync error:', error);
    });
  },

  async saveMessage(userId: string, message: ChatMessage) {
    const docRef = doc(db, `users/${userId}/messages`, message.id);
    await setDoc(docRef, {
      ...message,
      createdAt: serverTimestamp(),
    }, { merge: true });
  },

  async clearMessages(userId: string, messageIds: string[]) {
    for (const id of messageIds) {
      await deleteDoc(doc(db, `users/${userId}/messages`, id));
    }
  },

  // Sync Journal
  subscribeJournal(userId: string, onUpdate: (entries: JournalEntry[]) => void) {
    const q = query(collection(db, `users/${userId}/journal`), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as JournalEntry);
      });
      onUpdate(items);
    }, (error) => {
      console.warn('Journal sync error:', error);
    });
  },

  async saveJournalEntry(userId: string, entry: JournalEntry) {
    const docRef = doc(db, `users/${userId}/journal`, entry.id);
    await setDoc(docRef, entry, { merge: true });
  },

  async deleteJournalEntry(userId: string, entryId: string) {
    await deleteDoc(doc(db, `users/${userId}/journal`, entryId));
  },

  // Sync Goals
  subscribeGoals(userId: string, onUpdate: (goals: GoalItem[]) => void) {
    const q = query(collection(db, `users/${userId}/goals`));
    return onSnapshot(q, (snapshot) => {
      const items: GoalItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as GoalItem);
      });
      onUpdate(items);
    }, (error) => {
      console.warn('Goals sync error:', error);
    });
  },

  async saveGoal(userId: string, goal: GoalItem) {
    const docRef = doc(db, `users/${userId}/goals`, goal.id);
    await setDoc(docRef, goal, { merge: true });
  },

  async deleteGoal(userId: string, goalId: string) {
    await deleteDoc(doc(db, `users/${userId}/goals`, goalId));
  },

  // Sync Saved Prayers
  subscribePrayers(userId: string, onUpdate: (prayers: SavedPrayer[]) => void) {
    const q = query(collection(db, `users/${userId}/prayers`));
    return onSnapshot(q, (snapshot) => {
      const items: SavedPrayer[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as SavedPrayer);
      });
      onUpdate(items);
    }, (error) => {
      console.warn('Prayers sync error:', error);
    });
  },

  async savePrayer(userId: string, prayer: SavedPrayer) {
    const docRef = doc(db, `users/${userId}/prayers`, prayer.id);
    await setDoc(docRef, prayer, { merge: true });
  },

  async deletePrayer(userId: string, prayerId: string) {
    await deleteDoc(doc(db, `users/${userId}/prayers`, prayerId));
  },

  // Sync Favorites & Preferences
  subscribePreferences(userId: string, onUpdate: (prefs: { favoritedVerseIds?: string[]; theme?: 'light' | 'dark'; voiceSettings?: VoiceSettings }) => void) {
    const docRef = doc(db, `users/${userId}/preferences/settings`);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as any);
      }
    }, (error) => {
      console.warn('Preferences sync error:', error);
    });
  },

  async updatePreferences(userId: string, prefs: { favoritedVerseIds?: string[]; theme?: 'light' | 'dark'; voiceSettings?: Partial<VoiceSettings> }) {
    const docRef = doc(db, `users/${userId}/preferences/settings`);
    await setDoc(docRef, prefs, { merge: true });
  }
};
