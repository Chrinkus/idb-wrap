function idb() {
    // Private reference
    let db;

    /* DB Management
     * openDB - create, access, update
     * deleteDB - delete
     */

    function openDB(config) {
        const { name, version, upgrade } = config;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = () => upgrade(request.result);
        })
        .then(dbRef => {
            db = dbRef;

            return Promise.resolve(`opened ${name}, version ${version}`);
        })
        .catch(console.error);
    }

    function deleteDB(connection) {
        const { name, version } = connection;

        connection.close();

        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(name);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(`${name} ${version} deleted`);
        })
        .catch(console.error);
    }

    /* CRUD ops
     * addOne
     * getOne
     * updateOne
     * deleteOne
     */

    function getOne(store, key) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readonly')
                .objectStore(store)
                .get(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function addOne(store, record) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readwrite')
                .objectStore(store)
                .add(record);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /* The behaviour of the ObjectStore.delete() method is to take either
     * a key or a key range thus allowing the delete to remove a single or
     * many records from the store. To reflect this capability 'deleteSome'
     * has been chosen as the appropriate name for this function.
     */
    function deleteSome(store, key) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readwrite')
                .objectStore(store)
                .delete(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function updateOne(store, key, changes) {
        const storeRef = db
            .transaction(store, 'readwrite')
            .objectStore(store);

        return new Promise((resolve, reject) => {
            const request = storeRef.get(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        })
        .then(record => {
            Object.keys(changes).forEach(key => {
                record[key] = changes[key];
            });

            return new Promise((resolve, reject) => {
                const request = storeRef.keyPath
                        ? storeRef.put(record)
                        : storeRef.put(record, key);

                request.onerror = () => reject(request.errorCode);
                request.onsuccess = () => resolve(request.result);
            });
        });
    }

    return Object.freeze({
        // connection reference
        get connection() {
            return db;
        },

        // DB management
        openDB,
        deleteDB,

        // CRUD
        getOne,
        addOne,
        deleteSome,
        updateOne
    });
}
