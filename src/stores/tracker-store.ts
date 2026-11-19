import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export interface SavedTracker {
  id: string;
  category: "EB1" | "EB2" | "EB3" | "F1" | "F2A" | "F2B" | "F3" | "F4";
  country: "India" | "China" | "Mexico" | "Philippines" | "All Other";
  priorityDate: string; // ISO date string
  path: "AOS" | "CP";
  label: string;
  createdAt: string; // ISO date string
}

interface TrackerState {
  savedTrackers: SavedTracker[];
  activeUid: string | null;
  addTracker: (tracker: Omit<SavedTracker, "id" | "createdAt">) => void;
  removeTracker: (id: string) => void;
  updateTracker: (id: string, updates: Partial<Omit<SavedTracker, "id" | "createdAt">>) => void;
  /** Subscribe to Firestore saved_trackers for an authenticated user */
  syncForUser: (uid: string | null) => () => void;
}

function toFirestoreRecord(uid: string, tracker: SavedTracker) {
  return {
    id: tracker.id,
    uid,
    category: tracker.category,
    country: tracker.country,
    priorityDate: tracker.priorityDate,
    path: tracker.path,
    label: tracker.label,
    createdAt: tracker.createdAt,
  };
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      savedTrackers: [],
      activeUid: null,

      addTracker: (tracker) => {
        const newTracker: SavedTracker = {
          ...tracker,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          savedTrackers: [newTracker, ...state.savedTrackers],
        }));

        const uid = get().activeUid;
        const db = getFirebaseDb();
        if (uid && db) {
          setDoc(
            doc(db, "users", uid, "saved_trackers", newTracker.id),
            toFirestoreRecord(uid, newTracker),
          ).catch((err) => {
            console.error("[tracker-store] Failed to save tracker to Firestore:", err);
          });
        }
      },

      removeTracker: (id) => {
        set((state) => ({
          savedTrackers: state.savedTrackers.filter((t) => t.id !== id),
        }));

        const uid = get().activeUid;
        const db = getFirebaseDb();
        if (uid && db) {
          deleteDoc(doc(db, "users", uid, "saved_trackers", id)).catch((err) => {
            console.error("[tracker-store] Failed to delete tracker from Firestore:", err);
          });
        }
      },

      updateTracker: (id, updates) => {
        set((state) => ({
          savedTrackers: state.savedTrackers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));

        const uid = get().activeUid;
        const db = getFirebaseDb();
        if (uid && db) {
          const allowedUpdates: Record<string, string> = {};
          if (updates.category !== undefined) allowedUpdates.category = updates.category;
          if (updates.country !== undefined) allowedUpdates.country = updates.country;
          if (updates.priorityDate !== undefined) allowedUpdates.priorityDate = updates.priorityDate;
          if (updates.path !== undefined) allowedUpdates.path = updates.path;
          if (updates.label !== undefined) allowedUpdates.label = updates.label;

          if (Object.keys(allowedUpdates).length > 0) {
            updateDoc(
              doc(db, "users", uid, "saved_trackers", id),
              allowedUpdates,
            ).catch((err) => {
              console.error("[tracker-store] Failed to update tracker in Firestore:", err);
            });
          }
        }
      },

      syncForUser: (uid) => {
        if (!uid) {
          set({ activeUid: null });
          return () => {};
        }

        const db = getFirebaseDb();
        if (!db) {
          set({ activeUid: uid });
          return () => {};
        }

        set({ activeUid: uid });
        const trackersCol = collection(db, "users", uid, "saved_trackers");
        let cancelled = false;

        // Upload any locally created trackers that aren't in Firestore yet
        getDocs(trackersCol)
          .then((existingSnap) => {
            if (cancelled) return;
            const existingIds = new Set(existingSnap.docs.map((d) => d.id));
            const localTrackers = get().savedTrackers;
            for (const local of localTrackers) {
              if (!existingIds.has(local.id)) {
                setDoc(
                  doc(db, "users", uid, "saved_trackers", local.id),
                  toFirestoreRecord(uid, local),
                ).catch((err) => {
                  console.error("[tracker-store] Failed to sync local tracker:", err);
                });
              }
            }
          })
          .catch((err) => {
            console.error("[tracker-store] Failed to check remote trackers:", err);
          });

        // Real-time snapshot listener is strictly required here to keep saved trackers
        // synced across tabs and devices for signed-in users.
        const q = query(trackersCol, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const remoteTrackers: SavedTracker[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: (data.id as string) || d.id,
                category: data.category as SavedTracker["category"],
                country: data.country as SavedTracker["country"],
                priorityDate: data.priorityDate as string,
                path: data.path as SavedTracker["path"],
                label: data.label as string,
                createdAt: data.createdAt as string,
              };
            });
            set({ savedTrackers: remoteTrackers });
          },
          (err) => {
            console.error("[tracker-store] Firestore sync listener error:", err);
          },
        );

        return () => {
          cancelled = true;
          unsubscribe();
        };
      },
    }),
    {
      name: "visadate-tracker-storage",
      partialize: (state) => ({ savedTrackers: state.savedTrackers }),
    }
  )
);
