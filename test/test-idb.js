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

describe('idb', function() {
    describe('#openDB', function() {
        let db;

        before(async function() {
            db = idb();
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        afterEach(function() {
            db.connection.close();
        });

        after(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('db has correct name', function() {
            db.connection.name.should.equal(DB_NAME);
        });

        it('db contains expected object store', function() {
            db.connection.objectStoreNames.contains(DB_STORE)
                .should.equal(true);
        });

        it('can add a new object store', async function() {
            const NEW_STORE = 'anotherStore';

            await db.openDB({
                name: DB_NAME,
                version: 2,
                upgrade(dbRef) {
                    dbRef.createObjectStore(NEW_STORE);
                }
            }).then(console.log);

            db.connection.objectStoreNames.contains(NEW_STORE)
                .should.equal(true);
        });
    });

    describe('#getOne', function() {
        let db = idb();

        before(async function() {
            await db.openDB({
                name: DB_NAME,
                version: 1,
                upgrade(dbRef) {
                    const store = dbRef.createObjectStore(DB_STORE,
                            { autoIncrement: true });

                    store.put('boat');
                    store.put('car');
                    store.put('truck');
                }
            }).then(console.log);
        });

        after(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('retrieves the correct record from the db', async function() {
            const result = await db.getOne(DB_STORE, 1);
            result.should.equal('boat');
        });
    });

    describe('#addOne', function() {
        let db = idb();

        before(async function() {
            await db.openDB({
                name: DB_NAME,
                version: 1,
                upgrade(dbRef) {
                    const store = dbRef.createObjectStore(DB_STORE,
                            { autoIncrement: true });
                }
            }).then(console.log);
        });

        after(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('inserts a record into a db', async function() {
            const record = 'plane';
            await db.addOne(DB_STORE, record);
            const result = await db.getOne(DB_STORE, 1);
            result.should.equal(record);
        });
    });
});
