const DB_NAME = "arbejdsmiljoe-plan-files";
const STORE_NAME = "pending-files";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingPlanFile(threadId: string, file: File) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, threadId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function takePendingPlanFile(threadId: string): Promise<File | null> {
  const database = await openDatabase();
  const file = await new Promise<File | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(threadId);
    request.onsuccess = () => {
      store.delete(threadId);
      resolve(request.result as File | undefined);
    };
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file ?? null;
}
