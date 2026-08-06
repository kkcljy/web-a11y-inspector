const DATABASE_NAME = "a11y-lens";
const DATABASE_VERSION = 1;
const INSPECTION_STORE = "inspections";

export async function saveInspection(result) {
  if (!result?.runId) throw new Error("저장할 검사 결과에 runId가 없습니다.");
  const database = await openDatabase();
  await runTransaction(database, "readwrite", (store) => store.put(result));
  database.close();
  return result;
}

export async function listInspections(limit = 8) {
  const database = await openDatabase();
  const results = await new Promise((resolve, reject) => {
    const transaction = database.transaction(INSPECTION_STORE, "readonly");
    const store = transaction.objectStore(INSPECTION_STORE);
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev");
    const items = [];

    request.addEventListener("success", () => {
      const cursor = request.result;
      if (!cursor || items.length >= limit) {
        resolve(items);
        return;
      }
      items.push(cursor.value);
      cursor.continue();
    });
    request.addEventListener("error", () => reject(request.error || new Error("검사 이력을 불러오지 못했습니다.")));
  });
  database.close();
  return results;
}

export async function deleteInspection(runId) {
  const database = await openDatabase();
  await runTransaction(database, "readwrite", (store) => store.delete(runId));
  database.close();
}

function openDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("이 브라우저는 IndexedDB를 지원하지 않습니다."));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (database.objectStoreNames.contains(INSPECTION_STORE)) return;
      const store = database.createObjectStore(INSPECTION_STORE, { keyPath: "runId" });
      store.createIndex("createdAt", "createdAt");
      store.createIndex("targetUrl", "target.normalizedUrl");
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error || new Error("검사 이력 데이터베이스를 열지 못했습니다.")));
    request.addEventListener("blocked", () => reject(new Error("검사 이력 데이터베이스가 다른 탭에서 사용 중입니다.")));
  });
}

function runTransaction(database, mode, operation) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(INSPECTION_STORE, mode);
    const store = transaction.objectStore(INSPECTION_STORE);
    operation(store);
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => reject(transaction.error || new Error("검사 이력을 저장하지 못했습니다.")));
    transaction.addEventListener("abort", () => reject(transaction.error || new Error("검사 이력 저장이 취소되었습니다.")));
  });
}
