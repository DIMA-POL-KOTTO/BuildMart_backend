import "dotenv/config";
import memjs from "memjs";
import { randomUUID } from "node:crypto";

const client = memjs.Client.create(process.env.MEMCACHED_SERVERS);

export function getCache(key) {
    return new Promise((resolve) => {
        client.get(key, (error, value) => {
            if (error) {
                console.warn("Memcached error (GET): ", error);
                return resolve(null);
            }
            if (value == null) {
                return resolve(null);
            }
            try {
                resolve(JSON.parse(value.toString()));
            } catch (error) {
                console.warn(error);
                resolve(null);
            }
        });
    });
}

export function setCache(key, data, ttl=90) {
    return new Promise((resolve) => {
        client.set(key, JSON.stringify(data), { expires: ttl }, (error) => {
            if (error) {
                console.warn("Memcached error (SET): ", error);
                return resolve(false);
            }
            resolve(true);
        });
    });
}

export function deleteCache(key) {
    return new Promise((resolve) => {
        client.delete(key, (error) => {
            if (error) {
                console.warn("Memcached error (DELETE): ", error);
                return resolve(false);
            }
            resolve(true);
        })
    })
}

export async function getCatalogVersion() {
    const key = "products:version";
    let version = await getCache(key);
    if (version !== null) {
        return version;
    }
    version = randomUUID();
    await setCache(key, version, 0);
    return version;
}

export async function invalidateCatalogCache() {
    const newVersion = randomUUID();
    return setCache("products:version", newVersion, 0);
}