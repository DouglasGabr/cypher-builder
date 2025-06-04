# cypher-builder

Fluent CQL Builder for Neo4j

[![Node.js Package](https://github.com/DouglasGabr/cypher-builder/actions/workflows/npmpublish.yml/badge.svg)](https://github.com/DouglasGabr/cypher-builder/actions/workflows/npmpublish.yml)

## Installation

```bash
npm install @douglasgabr/cypher-builder
```

## Usage

### Type inference (required for typescript projects)

First, you must create a `*.d.ts` file in your project, in order to type the possible nodes, relationships and their properties.

```typescript
// neo4j-types.d.ts
import '@douglasgabr/cypher-builder';

declare module '@douglasgabr/cypher-builder' {
  export interface CypherBuilderNodes {
    User: {
      id: string;
    };
  }

  export interface CypherBuilderRelationships {
    KNOWS: {
      level: 'friendship' | 'colleague';
    };
  }
}
```

That will enable your IDE (tested only in VSCode) to suggest values for your node labels, relationship types and its properties.

**Node Label suggestion:**

![node label suggestion](./images/node-label.png)

**Node Properties suggestion:**

![node properties suggestion](./images/node-properties.png)

**Relationship Type suggestion:**

![relationship type suggestion](./images/relationship-type.png)

### Example

```typescript
import { Builder } from '@douglasgabr/cypher-builder';

const queryBuilder = new Builder()
  .match((match) => {
    match
      .node('person', 'Person', { name: 'Alice' })
      .relationship('either', 'KNOWS')
      .node('friend', 'Person'),
  })
  .where((where) => where.and('friend.age', '>=', 18))
  .return('person', 'friend');
const { query, parameters } = queryBuilder.buildQueryObject();
```

query:

```
MATCH (person:Person{ name: $person_name })-[:KNOWS]-(friend:Person)
WHERE friend.age >= $friend_age
RETURN person, friend
```

parameters:

```typescript
{
  person_name: 'Alice',
  friend_age: 18
}
```

### Using literals

By default, all values passed to the builder (such as node/relationship properties, WHERE/SET values, etc.) are tracked as parameters and replaced with parameter placeholders (e.g., `$user_id`). This helps prevent Cypher injection and allows Neo4j to optimize queries.

If you want to use a literal value directly in the query (for example, referencing another variable or property in the query), you can use the `literal` utility:

```typescript
import { Builder, literal } from '@douglasgabr/cypher-builder';

const builder = new Builder()
  .unwind(data, 'data')
  .match((m) => {
    m.node('user', 'User', { id: literal('data.id') });
  })
  .where((w) => w.and('user.createdAt', '>=', literal('datetime("2024-01-01T00:00:00Z")')));
  .set((s) => s.set('user.name', literal('data.name')));
const { query, parameters } = builder.buildQueryObject();
```

This will generate:

```
UNWIND $data AS data
MATCH (user:User { id: data.id })
WHERE user.createdAt >= datetime("2024-01-01T00:00:00Z")
SET user.name = data.name
```

**Note:** Use `literal` only when you are sure the value is safe and does not come from user input. All other values should be passed as regular values so they are tracked as parameters for safety and performance.
