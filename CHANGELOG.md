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
