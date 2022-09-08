export type Tag = {
  name: string;
  color?: string;
};
export type Action = {
  type: "trim" | "compressToSize" | "extractAudio";
  args?: any[];
};

export type Variation = {
  path: string;
  name: string;
  actions: Action[];
};

export type Video = {
  path: string;
  name: string;
  seen: boolean;
  tags: Tag[];
  variations: Variation[];
};

export type DatabaseRoot = {
  videos: Video[];
  tags: Tag[]; // Order here controls tag importance
  startCount: number;
};

let proxies = new WeakMap<any, any>();
const isProxy = Symbol("isProxy");
function createProxy(obj: any): any {
  return new Proxy(obj, {
    set: (target, prop, value) => {
      target[prop] = value;
      saveStorage();
      return true;
    },
    get: (target, prop) => {
      if (prop == isProxy) return true;
      if (typeof target[prop] == "object") {
        if (target[prop][isProxy]) return target[prop];
        if (!proxies.has(target[prop])) {
          let proxy = createProxy(target[prop]);
          proxies.set(target[prop], proxy);
          return proxy
        }
        return proxies.get(target[prop]);
      } else return target[prop];
    },
  });
}

let saveId: NodeJS.Immediate | null = null;
function saveStorage() {
  if (saveId == null)
    saveId = setImmediate(() => {
      saveId = null;
      console.log("Saving");
      localStorage.setItem("database", JSON.stringify(realDb));
    });
}

const realDb = localStorage.getItem("database")
  ? JSON.parse(localStorage.getItem("database")!)
  : {
    videos: [],
    tags: [],
    startCount: 0,
  };
export const db: DatabaseRoot = createProxy(realDb);

export function tagForName(name: string): Tag {
  // if tag exists, return it. else add a tag and return it
  const tag = db.tags.find((t) => t.name.toLowerCase() == name.toLowerCase());
  if (tag) return tag;
  const newTag = { name };
  db.tags.push(newTag);
  return newTag;
}

export let videoPath = "Y:/ReLive Videos/Videos";
export let variationPath = "C:/Users/Temm/Videos/Replay Variations";
