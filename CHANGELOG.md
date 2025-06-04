# 4.4.0 / 2025-06-04

- feat: add [`REMOVE`](https://neo4j.com/docs/cypher-manual/current/clauses/remove/) clause support

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';

  const builder = new Builder()
    .match((m) => {
      m.node('n', 'User', { id: '1' });
    })
    .remove('n.name', 'n.age');
  // MATCH (n:User{ id: "1" })
  // REMOVE n.name, n.age
  const builder = new Builder()
    .match((m) => {
      m.node('n', 'User', { id: '1' });
    })
    .remove(['n', 'User'], ['n', ['Admin', 'Label']]); // labels are type-checked
  // MATCH (n:User{ id: "1" })
  // REMOVE n:User, n:Admin:Label
  ```

# 4.3.0 / 2024-11-28

- feat: add `interpolate` method.

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';

  const builder = new Builder().match((m) => {
    m.node('n', 'User', { id: '1' });
  });
  const query = builder.interpolate();
  // MATCH (n:User{ id: "1" })
  ```

# 4.2.0 / 2022-10-28

- refactor: add query runner object parameter to builder run function

  ```typescript
  import neo4j from 'neo4j-driver';
  import { Builder } from '@douglasgabr/cypher-builder';

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    await new Builder()
      .match((m) => {
        m.node('n');
      })
      .return('n')
      .run(session);
  } finally {
    await session.close();
  }
  ```

  This is deprecated:

  ```typescript
  // potentially unsafe, since `session.run` might use `this` internally
  new Builder().run(session.run);
  // correct way, but too verbose
  new Builder().run(session.run.bind(session));
  ```

- refactor: publish ES modules and ship typescript source

# 4.1.0 / 2022-10-07

- feat(clauses): add call procedure and yield clauses

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';

  const builder = new Builder()
    .call('dbms.procedures()')
    .yield('name', 'signature');
  /**
   * CALL dbms.procedures()
   * YIELD name, signature
   */
  ```

# 4.0.0 / 2022-09-22

## Breaking Changes

The only breaking change in this major release is dropping support of Node 12, since it is no longer maintained.

# 3.7.0 / 2022-09-22

- feat(clauses): add [hint clauses](https://neo4j.com/docs/cypher-manual/current/query-tuning/using/) to query builder
  - `usingIndex`
  - `usingIndexSeek`
  - `usingScan`
  - `usingJoinOn`
  - [`callInTransactions`](https://neo4j.com/docs/cypher-manual/current/clauses/call-subquery/#subquery-call-in-transactions) (previously [`USING PERIODIC COMMIT`](https://neo4j.com/docs/cypher-manual/current/query-tuning/using/#query-using-periodic-commit-hint))

# 3.6.0 / 2022-08-31

- feat(clauses): add CALL clause

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';

  const builder = new Builder()
    .match((m) => {
      m.node('a', 'User', { id: '1' });
    })
    .call((b) => {
      b.with('a')
        .match((m) => {
          m.node('a').relationship().node('b', 'User', { id: '2' });
        })
        .return('b');
    })
    .return('a', 'b');
  /**
   * MATCH (a:User{ id: $a_id })
   * CALL {
   *   WITH a
   *   MATCH (a)--(b:User{ id: $b_id })
   *   RETURN b
   * }
   * RETURN a, b
   */
  ```

# 3.5.0 / 2022-07-29

- feat(patterns): ✨ add path name variable to MATCH

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';

  new Builder().match('p', (m) => m.node('a').relationship().node('b'));
  // MATCH p = (a)--(b)
  ```

# 3.4.1 / 2022-04-05

- fix(pagination): use neo4j driver `int` constructor for limit and skip

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';
  import { int } from 'neo4j-driver';

  new Builder().limit(1).skip(2);
  // parameters will be
  const parameters = { limit: int(1), skip: int(2) };
  ```

# 3.4.0 / 2022-01-16

- refactor(clauses): enable use of literal util in set clause

  ```typescript
  import { Builder, literal } from '@douglasgabr/cypher-builder';
  new Builder().set((s) => {
    // deprecated
    s.setLiteral('foo', 'bar');

    // new
    s.set('foo', literal('bar'));
  });
  ```

# 3.3.0 / 2022-01-07

- feat(builder): ✨ add `addParameter` to builder

  - enable option to add custom arbitrary parameters to builder

  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';
  const builder = new Builder();

  // returns builder for method chaining
  builder.addParameter('value', 'name');
  // { value: 'name' }

  // if parameter name is not provided, it will be generated
  const generatedParameterName = builder.addParameter('value');
  // { [generatedParameterName]: 'value' }
  ```

# 3.2.0 / 2022-01-06

- feat(clauses): add function predicates to where clause
  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';
  new Builder().where((w) => {
    w.andAll('item', 'list', (w) => w.and('item', '>', 0))
      .andExists('other')
      .orExists((p) => p.node('n1').relationship().node('n2'));
  });
  // WHERE all(item IN list WHERE item > $item)
  //   AND exists(other)
  //   OR exists((n1)--(n2))
  // $item => 0
  ```

# 3.1.0 / 2021-10-23

- feat(clauses): add create clause
  ```typescript
  import { Builder } from '@douglasgabr/cypher-builder';
  new Builder().create((c) => c.node('user', 'User'));
  // CREATE (user:User)
  ```

# 3.0.0 / 2021-10-10

- 💥 BREAKING CHANGE: where clause `...Literal` methods removed.
- feat: add `literal` utility
  ```typescript
  import { Builder, literal } from '@douglasgabr/cypher-builder';
  new Builder()
    .match((m) => m.node('user', 'User', { id: literal('literal.id') }))
    .where((w) => w.and('user.name', literal('friend.name')));
  // MATCH (user:User{ id: literal.id })
  // WHERE user.name = friend.name
  ```

# 2.2.0 / 2021-10-09

- feat: only add clauses to builder if needed
  ```typescript
  const filter = { name: '' }; // empty filter
  new Builder()
    .match((m) => m.node('person'))
    .where((w) => {
      if (filter.name) {
        // will not execute
        w.and('person.name', filter.name);
      }
    })
    .return('person')
    .build();
  // MATCH (person)
  // RETURN person
  ```

# 2.1.0 / 2021-10-09

- fix(patterns): don't add brackets to empty relationship patterns (`.relationship()`)
  - before: `-[]-`
  - after: `--`
- feat(clauses): add label predicates to where:

  ```typescript
  new Builder()
    .where((w) => {
      w.andLabel('user', 'User').andLabel('admin', ['User', 'Admin']);
    })
    .build();
  // WHERE user:User AND admin:User:Admin
  ```

# 2.0.0 / 2021-10-07

- 💥 BREAKING CHANGE: `RelationshipDirection` is now just a string union, so previous usages as an enum must be updated
- chore: rename some `order by` types and export them in the index file

# 1.2.0 / 2021-10-07

- feat: add `delete` and `detachDelete` to builder

# 1.1.0 / 2021-10-06

- feat: add `orderBy` to builder
- chore: start inline documentation

# 1.0.0 / 2021-10-04

- Initial Release
