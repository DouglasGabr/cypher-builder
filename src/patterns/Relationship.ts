import { ParametersBag } from '../parameters/ParametersBag';
import { CypherBuilderNodes } from '../types/labels-and-properties';
import { StringBuilder } from '../types/string-builder';
import { Literal } from '../utils/literal';
import { Node } from './Node';
import { Properties } from './Properties';

type WithLiteral<T> = {
  [P in keyof T]: T[P] | Literal;
};

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
  private properties?: Properties;
  private limits?: RelationshipLimits;
  private rightNode?: Node;

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
    properties?: Properties,
    limits?: RelationshipLimits,
    private parametersBag = new ParametersBag(),
  ) {
    this.direction = direction ?? 'either';
    this.alias = alias ?? '';
    this.types = types ?? [];
    this.properties = properties;
    this.limits = limits;
  }

  node<
    Label extends keyof CypherBuilderNodes & string,
    Properties extends CypherBuilderNodes[Label],
  >(
    alias?: string,
    labels?: Label | Label[],
    properties?: Partial<WithLiteral<Properties>>,
  ): Node {
    const _labels = Array.isArray(labels)
      ? labels
      : typeof labels === 'string'
      ? [labels]
      : undefined;
    this.rightNode = new Node(
      alias,
      _labels,
      properties
        ? Properties.fromRawProperties(properties, this.parametersBag)
        : undefined,
    );
    return this.rightNode;
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
    return this.properties?.build() ?? '';
  }

  #buildTypesString() {
    return this.types.length > 0 ? `:${this.types.join('|')}` : '';
  }
}
