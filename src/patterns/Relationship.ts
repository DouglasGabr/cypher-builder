import { StringBuilder } from '../types/string-builder';

export enum RelationshipDirection {
  In = '<-',
  Out = '->',
  Either = '--',
}

export type RelationshipLimits =
  | number
  | [start: number, end: number]
  | [start: number, end?: null]
  | [start: null | undefined, end: number]
  | '*';

/**
 * @see [Patterns for relationships](https://neo4j.com/docs/cypher-manual/current/syntax/patterns/#cypher-pattern-relationship)
 */
export class Relationship implements StringBuilder {
  private direction: RelationshipDirection;
  private alias: string;
  private types: string[];
  private properties?: Record<string, string>;
  private limits?: RelationshipLimits;

  constructor(
    direction?: RelationshipDirection,
    alias?: string,
    types?: string[],
    properties?: Record<string, string>,
    limits?: RelationshipLimits,
  ) {
    this.direction = direction ?? RelationshipDirection.Either;
    this.alias = alias ?? '';
    this.types = types ?? [];
    this.properties = properties;
    this.limits = limits;
  }

  build(): string {
    let relationshipString = '';
    if (this.direction === RelationshipDirection.In) {
      relationshipString += '<';
    }
    relationshipString += `-[${this.alias}`;

    if (this.types.length > 0) {
      relationshipString += `:${this.types.join('|')}`;
    }

    if (this.limits) {
      relationshipString += '*';
      if (typeof this.limits === 'number') {
        relationshipString += this.limits.toString();
      } else if (Array.isArray(this.limits)) {
        const [start, end] = this.limits;
        if (typeof start === 'number') {
          relationshipString += start.toString();
        }
        relationshipString += '..';
        if (typeof end === 'number') {
          relationshipString += end.toString();
        }
      }
    }

    if (this.properties) {
      relationshipString += ` { ${Object.entries(this.properties)
        .map(([label, value]) => `${label}: ${value}`)
        .join(', ')} }`;
    }

    relationshipString += ']-';
    if (this.direction === RelationshipDirection.Out) {
      relationshipString += '>';
    }
    return relationshipString;
  }
}
