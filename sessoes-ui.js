// ─────────────────────────────────────────────────────────────
// Configuração do Firebase — Projeto "Auditora da RFB"
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, deleteDoc, query, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm0nRYT1iXnLLU5zXY654yioV60yFi88g",
  authDomain: "auditora-da-rfb.firebaseapp.com",
  projectId: "auditora-da-rfb",
  storageBucket: "auditora-da-rfb.firebasestorage.app",
  messagingSenderId: "878627631769",
  appId: "1:878627631769:web:51f23ad43462a979e6fe08"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── Helpers genéricos do Firestore, usados pelos outros módulos ───

export async function getDocument(colName, docId) {
  const ref = doc(db, colName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setDocument(colName, docId, data) {
  const ref = doc(db, colName, docId);
  await setDoc(ref, data, { merge: true });
  return { id: docId, ...data };
}

export async function getAllDocs(colName) {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addDocument(colName, data) {
  const ref = await addDoc(collection(db, colName), data);
  return { id: ref.id, ...data };
}

export async function updateDocument(colName, docId, data) {
  const ref = doc(db, colName, docId);
  await updateDoc(ref, data);
  return { id: docId, ...data };
}

export async function deleteDocument(colName, docId) {
  await deleteDoc(doc(db, colName, docId));
  return docId;
}

export function watchCollection(colName, callback) {
  return onSnapshot(collection(db, colName), (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}
