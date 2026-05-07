const ROOT_TABLE = "/";
const DEFAULT_ROOM_ID = "TEST-LIGHTDB-ROOM-ID";

const instances = [];

function isPlainObject(value) {
  return Object.getPrototypeOf(value) === Object.prototype;
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

function updateTable(table, newData) {
  if (!table) {
    return deepCopy(newData);
  }

  let newTableData = deepCopy(table);

  for (const [key, value] of Object.entries(newData)) {
    if (value === null) {
      delete newTableData[key];
      continue;
    }

    if (isPlainObject(value)) {
      const currentValue = newTableData[key] || {};
      const nextValue = {};

      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue === null) {
          delete currentValue[subKey];
          continue;
        }

        nextValue[subKey] = subValue;
      }

      newTableData = {
        ...newTableData,
        [key]: {
          ...currentValue,
          ...nextValue
        }
      };
    }
    else {
      newTableData = {
        ...newTableData,
        [key]: value
      };
    }
  }

  return newTableData;
}

export class LightDB {
  database = {};
  roomChief = false;
  listeners = {};
  peerListeners = {};

  constructor() {
    instances.push(this);
  }

  async createRoom() {
    this.roomChief = true;
    return DEFAULT_ROOM_ID;
  }

  async joinRoom() {
    this.roomChief = false;
    return this.database;
  }

  on(table, handler) {
    this.listeners[table] = handler;
  }

  onPeer(eventName, handler) {
    this.peerListeners[eventName] = handler;
  }

  async update(table = ROOT_TABLE, data = {}) {
    if (table === ROOT_TABLE) {
      this.database = updateTable(this.database, data);
      this.notify(table, this.database);
      return;
    }

    this.database = {
      ...this.database,
      [table]: updateTable(this.database[table], data)
    };

    this.notify(table, this.database[table]);
  }

  async clear() {
    this.database = {};
  }

  emitPeer(eventName, ...args) {
    this.peerListeners[eventName]?.(...args);
  }

  notify(table, data) {
    this.listeners[table]?.(data);
  }
}

export function __getMockLightDBInstances() {
  return instances;
}

export function __getLatestMockLightDB() {
  return instances[instances.length - 1];
}

export function __resetMockLightDB() {
  instances.splice(0, instances.length);
}
