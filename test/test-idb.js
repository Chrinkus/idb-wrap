/* Mocha and Chai linked through HTML
 * idb.js also linked through HTML
 */

const DB_STORE = 'testStore',
      DB_NAME = 'mochaTest';

function deleteDB(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onerror = () => reject(request.errorCode);
        request.onsuccess = () => resolve(request.result);
    })
    .catch(console.error);
}

describe('idb', function() {
    describe('#openDB', function() {
        let db, result;

        // set up DB
        before(async function() {
            db = idb();
            result = await db.openDB({
                name: DB_NAME,
                version: 1,
                upgrade(dbRef) {
                    dbRef.createObjectStore(DB_STORE);
                }
            });
        });

        // clean up DB
        after(async function() {
            await deleteDB(DB_NAME);
        });

        it('db contains expected object store', function() {
            result.objectStoreNames.contains(DB_STORE)
                .should.equal(true);
        });

        it('db is named', function() {
            result.name.should.equal(DB_NAME);
        });
    });
});
