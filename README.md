# cypher-builder

Fluent CQL Builder for Neo4j

## 🚨🚨🚨 Warning 🚨🚨🚨

**This package is in early stages of development, use it at your own risk.**

## Installation

```bash
npm install @douglasgabr/cypher-builder
```

or

```bash
yarn add @douglasgabr/cypher-builder
```

## Usage

```typescript
import { Builder, RelationshipDirection } from '@douglasgabr/cypher-builder';

const queryBuilder = new Builder()
  .match((match) =>
    match
      .node('person', 'Person', { name: 'Alice' })
      .relationship(RelationshipDirection.Either, 'KNOWS')
      .node('friend', 'Person'),
  )
  .where((where) => where.and('friend.age', '>=', 18))
  .return('person', 'friend');
const { query, parameters } = queryBuilder.buildQueryObject();
```

query:

```
MATCH (alice:Person{ name: $param1 })-[:KNOWS]-(friend:Person)
WHERE friend.age >= $param2
RETURN person, friend
```

parameters:

```typescript
{
  param1: 'Alice',
  param2: 18
}
```
