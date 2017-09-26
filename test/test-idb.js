/* Mocha and Chai linked through HTML
 * idb.js also linked through HTML
 */

const DB_STORE = 'testStore',
      DB_NAME = 'mochaTest',
      DB_SETUP_OBJ = {
          name: DB_NAME,
          version: 1,
          upgrade(dbRef) {
              console.log('upgrade fired');
              dbRef.createObjectStore(DB_STORE);
          }
      };

function deleteDB(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onerror = () => reject(request.errorCode);
        request.onsuccess = () => resolve(`${dbName} deleted`);
    })
    .catch(console.error);
}

describe('idb', function() {
    describe('#openDB', function() {
        let db;

        before(async function() {
            db = idb();
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        after(async function() {
            db.connection.close();
            await deleteDB(DB_NAME).then(console.log);
        });

        it('db contains expected object store', function() {
            db.connection.objectStoreNames.contains(DB_STORE)
                .should.equal(true);
        });

        it('db is named', function() {
            db.connection.name.should.equal(DB_NAME);
        });
    });
});
