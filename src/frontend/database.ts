export type Tag = {
  name: string;
  color: string;
}
export type Action = {
  type: "trim" | "compressToSize",
  args: any[],
}
export type DatabaseRoot = {
  videos: {
    path: string,
    name: string,
    seen: boolean,
    tags: Tag[],
    variations: {
      filename: string,
      name: string,
      actions: Action[]
    }[]
  }[],
  tags: Tag[], // Order here controls tag importance
  startCount: number
}

function createProxy(obj: any): any {
  return new Proxy(obj, {
    set: (target, prop, value) => {
      target[prop] = value;
      saveStorage();
      return true;
    },
    get: (target, prop) => {
      if (typeof target[prop] == "object") {
        return createProxy(target[prop]);
      } else return target[prop];
    }
  });
}

let saveId: NodeJS.Immediate | null = null;
function saveStorage() {
  console.log("Saving")
  if (saveId == null) saveId = setImmediate(() => {
    saveStorageNow();
    saveId = null;
  });
}

function saveStorageNow() {
  localStorage.setItem("database", JSON.stringify(db));
}

export const db: DatabaseRoot = createProxy(localStorage.getItem("database") ? JSON.parse(localStorage.getItem("database")!) : {
  videos: [],
  tags: [],
  startCount: 0
});