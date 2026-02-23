import { dbService } from './offline/db';

// --- MOCK DATABASE ---
class MockSnapshot {
  constructor(data) {
    this._data = data;
  }
  val() { return this._data; }
  get key() { return this._data.id; }
  forEach(callback) {
    if (Array.isArray(this._data)) {
      this._data.forEach(item => callback(new MockSnapshot(item)));
    }
  }
}

const firebaseDB = {};

const ref = (db, path) => {
  return {
    path,
    once: (type) => {
      if (type === 'value') {
        const parts = path.split('/');
        const collection = parts[0];
        const id = parts[1];
        let data = dbService.get(collection);
        if (id) {
          data = data.find(item => item.id === id);
        }
        return Promise.resolve(new MockSnapshot(data));
      }
    }
  };
};

const onValue = (refObj, callback) => {
  let data;
  if (refObj.isQuery) {
    data = refObj.execute();
  } else {
    const parts = refObj.path.split('/');
    const collection = parts[0];
    const id = parts[1];
    data = dbService.get(collection);
    if (id) {
      data = data.find(item => item.id === id);
    }
  }

  // Make callback asynchronous to avoid ReferenceError with unsubscribe
  setTimeout(() => {
    callback(new MockSnapshot(data));
  }, 0);

  return () => { }; // Unsubscribe
};

const query = (refObj, ...constraints) => {
  return {
    path: refObj.path,
    isQuery: true,
    execute: () => {
      let data = dbService.get(refObj.path);
      constraints.forEach(constraint => {
        data = constraint(data);
      });
      return data;
    }
  };
};

const limitToLast = (n) => (data) => data.slice(-n);
const orderByChild = (child) => (data) => data.sort((a, b) => (a[child] > b[child] ? 1 : -1));
const equalTo = (value) => (data) => data.filter(item => Object.values(item).includes(value));

const update = (refObj, data) => {
  const parts = refObj.path.split('/');
  const collection = parts[0];
  const id = parts[1];
  dbService.update(collection, id, data);
  return Promise.resolve();
};

const push = (refObj, data) => {
  const parts = refObj.path.split('/');
  const collection = parts[0];
  const newItem = dbService.push(collection, data);
  return Promise.resolve({ key: newItem.id });
};

// --- MOCK AUTH ---
const firebaseAuth = {
  currentUser: JSON.parse(localStorage.getItem('mcity_user'))
};

const signInWithEmailAndPassword = (auth, email, password) => {
  try {
    const user = dbService.login(email, password);
    localStorage.setItem('mcity_user', JSON.stringify(user));
    firebaseAuth.currentUser = user;
    return Promise.resolve({ user });
  } catch (e) {
    return Promise.reject(e);
  }
};

const onAuthStateChanged = (auth, callback) => {
  const user = JSON.parse(localStorage.getItem('mcity_user'));
  callback(user);
  return () => { };
};

const signOut = (auth) => {
  localStorage.removeItem('mcity_user');
  firebaseAuth.currentUser = null;
  return Promise.resolve();
};

// --- MOCK STORAGE ---
const firebaseStorage = {};
const uploadBytes = (storageRef, file) => {
  // In a real offline app, we might store the base64 or blob in IndexedDB
  // For now, let's just mock a successful upload
  return Promise.resolve();
};
const getDownloadURL = (storageRef) => {
  // Return the local path for offline assets
  return Promise.resolve(`/images/${storageRef.path}`);
};

// Exporting refs as used in firebase.js
const firebaseMatches = { path: 'matches' };
const firebasePromotions = { path: 'promotions' };
const firebaseTeams = { path: 'teams' };
const firebasePlayers = { path: 'players' };

export {
  firebaseAuth,
  firebaseStorage,
  firebaseMatches,
  firebasePromotions,
  firebaseTeams,
  firebasePlayers,
  firebaseDB,
  ref,
  onValue,
  update,
  push,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  uploadBytes,
  getDownloadURL,
  query,
  limitToLast,
  orderByChild,
  equalTo
};