import { ParametersBag } from '../parameters/ParametersBag';
import { CypherBuilderRelationships } from '../types/labels-and-properties';
import { StringBuilder } from '../types/string-builder';
import { Literal } from '../utils/literal';
import { Properties } from './Properties';
import {
  Relationship,
  RelationshipDirection,
  RelationshipLimits,
} from './Relationship';

type WithLiteral<T> = {
  [P in keyof T]: T[P] | Literal;
};

/**
 * @see [Patterns for nodes](https://neo4j.com/docs/cypher-manual/current/syntax/patterns/#cypher-pattern-node)
 */
export class Node implements StringBuilder {
  private alias: string;
  private labels: string[];
  private properties?: Properties;
  private rightRelationship?: Relationship;

  constructor(
    alias?: string,
    labels?: string[],
    properties?: Properties,
    private parametersBag = new ParametersBag(),
  ) {
    this.alias = alias ?? '';
    this.labels = labels ?? [];
    this.properties = properties;
  }

  relationship<
    T extends keyof CypherBuilderRelationships & string,
    P extends CypherBuilderRelationships[T],
  >(
    direction?: RelationshipDirection,
    types?: T | T[],
    alias?: string,
    limits?: RelationshipLimits,
    properties?: Partial<WithLiteral<P>>,
  ): Relationship {
    const _types = Array.isArray(types)
      ? types
      : typeof types === 'string'
      ? [types]
      : undefined;
    this.rightRelationship = new Relationship(
      direction,
      alias,
      _types,
      properties
        ? Properties.fromRawProperties(properties, this.parametersBag)
        : undefined,
      limits,
    );
    return this.rightRelationship;
  }

  build(): string {
    const labelsString =
      this.labels.length > 0 ? `:${this.labels.join(':')}` : '';
    const propertiesString = this.properties?.build() ?? '';
    const relationshipString = this.rightRelationship?.build() ?? '';
    return `(${this.alias}${labelsString}${propertiesString})${relationshipString}`;
  }
}
