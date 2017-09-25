function idb() {
    let db;

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
            return Promise.resolve(dbRef);
        })
        .catch(console.error);
    }

    return Object.freeze({
        openDB
    });
}
