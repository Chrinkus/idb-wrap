/* Mocha and Chai linked through HTML
 * idb.js also linked through HTML
 */

const DB_STORE = 'testStore',
      DB_NAME = 'mochaTest',
      DB_SETUP_OBJ = {
          name: DB_NAME,
          version: 1,
          upgrade(dbRef) {
              console.log('upgrade fired'); // status check

              const store = dbRef.createObjectStore(DB_STORE,
                      { keyPath: 'id' });

              store.put({ 'id': 1, 'type':'boat', 'wheels': 0 });
              store.put({ 'id': 2, 'type':'car', 'wheels': 4 });
              store.put({ 'id': 3, 'type':'truck', 'wheels': 4 });
          }
      };

describe('idb', function() {
    describe('#openDB', function() {
        let db = idb();

        before(async function() {
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
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        after(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('retrieves the correct record from the db', async function() {
            const result = await db.getOne(DB_STORE, 1);
            result.type.should.equal('boat');
        });
    });

    describe('#addOne', function() {
        let db = idb();

        before(async function() {
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        after(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('inserts a record into a db', async function() {
            const record = { 'id': 4, 'type': 'plane', 'wheels': 3 };
            await db.addOne(DB_STORE, record);
            const result = await db.getOne(DB_STORE, 4);
            result.should.deep.equal(record);
        });
    });

    describe('#deleteSome', function() {
        let db = idb();

        beforeEach(async function() {
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        afterEach(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('deletes a record from the db', async function() {
            await db.deleteSome(DB_STORE, 1);
            const result = await db.getOne(DB_STORE, 1);
            expect(result).to.equal(undefined);
        });

        it('deletes a range of records from the db', async function() {
            await db.deleteSome(DB_STORE, IDBKeyRange.upperBound(2));

            const result1 = await db.getOne(DB_STORE, 1),
                  result2 = await db.getOne(DB_STORE, 2),
                  result3 = await db.getOne(DB_STORE, 3);

            expect(result1).to.not.exist;
            expect(result2).to.not.exist;
            expect(result3).to.exist;
        });
    });

    describe('#updateOne', function() {
        let db = idb();

        beforeEach(async function() {
            await db.openDB(DB_SETUP_OBJ).then(console.log);
        });

        afterEach(async function() {
            await db.deleteDB(db.connection).then(console.log);
        });

        it('updates a record', async function() {
            await db.updateOne(DB_STORE, 3, { type: 'semi', wheels: 18 });
            const result = await db.getOne(DB_STORE, 3);
            result.should.deep.equal({ id: 3, type: 'semi', wheels: 18 });
        });
    });
});
