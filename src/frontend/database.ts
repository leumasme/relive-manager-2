export type Tag = {
  name: string;
  color?: string;
}
export type Action = {
  type: "trim" | "compressToSize",
  args: any[],
}

export type Video = {
  path: string,
  name: string,
  seen: boolean,
  tags: Tag[],
  variations: {
    filename: string,
    name: string,
    actions: Action[]
  }[]
};

export type DatabaseRoot = {
  videos: Video[],
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
  if (saveId == null) saveId = setImmediate(() => {
    saveId = null;
    console.log("Saving")
    localStorage.setItem("database", JSON.stringify(db));
  });
}

export const db: DatabaseRoot = createProxy(localStorage.getItem("database") ? JSON.parse(localStorage.getItem("database")!) : {
  videos: [],
  tags: [],
  startCount: 0
});

export function tagForName(name: string): Tag {
  // if tag exists, return it. else add a tag and return it
  const tag = db.tags.find(t => t.name.toLowerCase() == name.toLowerCase());
  if (tag) return tag;
  const newTag = { name };
  db.tags.push(newTag);
  return newTag;
}