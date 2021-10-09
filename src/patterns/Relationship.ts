import { StringBuilder } from '../types/string-builder';

export type RelationshipDirection = 'in' | 'out' | 'either';

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

  #buildArrowsString(): ['<-', '-'] | ['-', '->'] | ['-', '-'] {
    switch (this.direction) {
      case 'in':
        return ['<-', '-'];
      case 'out':
        return ['-', '->'];
      case 'either':
      default:
        return ['-', '-'];
    }
  }

  constructor(
    direction?: RelationshipDirection,
    alias?: string,
    types?: string[],
    properties?: Record<string, string>,
    limits?: RelationshipLimits,
  ) {
    this.direction = direction ?? 'either';
    this.alias = alias ?? '';
    this.types = types ?? [];
    this.properties = properties;
    this.limits = limits;
  }

  #buildLimitsString(): string {
    let limitsString = '';
    if (this.limits) {
      limitsString += '*';
      if (typeof this.limits === 'number') {
        limitsString += this.limits.toString();
      } else if (Array.isArray(this.limits)) {
        const [start, end] = this.limits;
        if (typeof start === 'number') {
          limitsString += start.toString();
        }
        limitsString += '..';
        if (typeof end === 'number') {
          limitsString += end.toString();
        }
      }
    }
    return limitsString;
  }

  build(): string {
    const aliasString = this.alias;
    const typesString = this.#buildTypesString();
    const limitsString = this.#buildLimitsString();
    const propertiesString = this.#buildPropertiesString();
    const [leftBracket, rightBracket] = this.#buildBracketsString(
      aliasString,
      typesString,
      limitsString,
      propertiesString,
    );
    const [leftArrow, rightArrow] = this.#buildArrowsString();
    return `${leftArrow}${leftBracket}${aliasString}${typesString}${limitsString}${propertiesString}${rightBracket}${rightArrow}`;
  }

  #buildBracketsString(
    aliasString: string,
    typesString: string,
    limitsString: string,
    propertiesString: string,
  ): ['[', ']'] | ['', ''] {
    return aliasString || typesString || limitsString || propertiesString
      ? ['[', ']']
      : ['', ''];
  }

  #buildPropertiesString() {
    if (this.properties) {
      return ` { ${Object.entries(this.properties)
        .map(([label, value]) => `${label}: ${value}`)
        .join(', ')} }`;
    }
    return '';
  }

  #buildTypesString() {
    return this.types.length > 0 ? `:${this.types.join('|')}` : '';
  }
}
