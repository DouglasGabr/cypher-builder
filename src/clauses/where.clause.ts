import { StringBuilder } from '../types/string-builder';
import { ParametersBag } from '../parameters/ParametersBag';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';

type Comparisons =
  | '='
  | '=~'
  | '>'
  | '>='
  | '<'
  | '<='
  | '<>'
  | 'IN'
  | 'STARTS WITH'
  | 'ENDS WITH'
  | 'CONTAINS';

type NullComparison = 'IS NULL';
const nullComparison: NullComparison = 'IS NULL';

class Comparator implements StringBuilder {
  constructor(
    private comparator: Comparisons,
    private field: string,
    private value: string,
  ) {}

  build() {
    return `${this.field} ${this.comparator} ${this.value}`;
  }
}

class NullComparator implements StringBuilder {
  constructor(private nullComparator: NullComparison, private field: string) {}

  build() {
    return `${this.field} ${this.nullComparator}`;
  }
}

class WherePredicate implements StringBuilder {
  constructor(
    private prefix: PredicatePrefix,
    private predicate: StringBuilder,
    private not: boolean,
    private shouldAddPrefix: boolean,
    private shouldAddParenthesis: boolean,
  ) {}

  build() {
    const [leftP, rightP] = this.shouldAddParenthesis
      ? (['(', ')'] as const)
      : (['', ''] as const);
    const prefixString = this.shouldAddPrefix ? `${this.prefix} ` : '';
    const notString = this.not ? 'NOT ' : '';
    return `${prefixString}${notString}${leftP}${this.predicate.build()}${rightP}`;
  }
}

type PredicatePrefix = 'AND' | 'OR' | 'XOR';

/**
 * @see [WHERE](https://neo4j.com/docs/cypher-manual/current/clauses/where/)
 */
export class WhereClause {
  protected prefix: 'WHERE' | '';
  protected parametersBag: ParametersBag;
  protected predicates: StringBuilder[] = [];
  constructor(parametersBag?: ParametersBag, prefix: 'WHERE' | '' = '') {
    this.parametersBag = parametersBag ?? new ParametersBag();
    this.prefix = prefix;
  }

  #addPredicate(prefix: PredicatePrefix, builder: StringBuilder, not: boolean) {
    this.predicates.push(
      new WherePredicate(
        prefix,
        builder,
        not,
        this.predicates.length > 0,
        builder instanceof WhereClauseStringBuilder &&
          builder.numberOfClauses > 1,
      ),
    );
    return this;
  }

  #addWhere(
    prefix: PredicatePrefix,
    builder: (whereBuilder: WhereClause) => unknown,
    not: boolean,
  ) {
    const whereBuilder = new WhereClauseStringBuilder(this.parametersBag);
    builder(whereBuilder);
    return this.#addPredicate(prefix, whereBuilder, not);
  }

  andNotWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('AND', builder, true);
  }
  andWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('AND', builder, false);
  }
  orNotWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('OR', builder, true);
  }
  orWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('OR', builder, false);
  }
  xorNotWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('XOR', builder, true);
  }
  xorWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this.#addWhere('XOR', builder, false);
  }

  #addPattern(
    prefix: PredicatePrefix,
    builder: (patternBuilder: PatternBuilder) => unknown,
    not: boolean,
  ) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    return this.#addPredicate(prefix, patternBuilder, not);
  }

  andNotPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('AND', builder, true);
  }
  andPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('AND', builder, false);
  }
  orNotPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('OR', builder, true);
  }
  orPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('OR', builder, false);
  }
  xorNotPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('XOR', builder, true);
  }
  xorPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this.#addPattern('XOR', builder, false);
  }

  #add(
    prefix: PredicatePrefix,
    not: boolean,
    field: string,
    comparator: unknown,
    value?: unknown,
  ): this {
    if (isNullComparator(comparator)) {
      const comp = new NullComparator(comparator, field);
      return this.#addPredicate(prefix, comp, not);
    }
    let _value: unknown;
    let _comparator: Comparisons;
    if (typeof value === 'undefined') {
      _comparator = '=';
      _value = comparator;
    } else {
      _comparator = comparator as Comparisons;
      _value = value;
    }
    const comp = new Comparator(
      _comparator,
      field,
      this.parametersBag.add(_value, true, field),
    );
    return this.#addPredicate(prefix, comp, not);
  }

  andNot(field: string, value: unknown): this;
  andNot(field: string, nullComparison: NullComparison): this;
  andNot(field: string, comparator: Comparisons, value: unknown): this;
  andNot(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('AND', true, field, comparator, value);
  }
  and(field: string, value: unknown): this;
  and(field: string, nullComparison: NullComparison): this;
  and(field: string, comparator: Comparisons, value: unknown): this;
  and(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('AND', false, field, comparator, value);
  }
  orNot(field: string, value: unknown): this;
  orNot(field: string, nullComparison: NullComparison): this;
  orNot(field: string, comparator: Comparisons, value: unknown): this;
  orNot(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('OR', true, field, comparator, value);
  }
  or(field: string, value: unknown): this;
  or(field: string, nullComparison: NullComparison): this;
  or(field: string, comparator: Comparisons, value: unknown): this;
  or(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('OR', false, field, comparator, value);
  }
  xorNot(field: string, value: unknown): this;
  xorNot(field: string, nullComparison: NullComparison): this;
  xorNot(field: string, comparator: Comparisons, value: unknown): this;
  xorNot(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('XOR', true, field, comparator, value);
  }
  xor(field: string, value: unknown): this;
  xor(field: string, nullComparison: NullComparison): this;
  xor(field: string, comparator: Comparisons, value: unknown): this;
  xor(field: string, comparator: unknown, value?: unknown): this {
    return this.#add('XOR', false, field, comparator, value);
  }

  #addLiteral(
    prefix: PredicatePrefix,
    not: boolean,
    field: string,
    comparatorOrValue: Comparisons | string,
    value?: string,
  ): this {
    let _value: string;
    let _comparator: Comparisons;
    if (typeof value === 'undefined') {
      _comparator = '=';
      _value = comparatorOrValue as string;
    } else {
      _comparator = comparatorOrValue as Comparisons;
      _value = value;
    }
    const comp = new Comparator(_comparator, field, _value);
    return this.#addPredicate(prefix, comp, not);
  }

  andLiteral(field: string, value: string): this;
  andLiteral(field: string, comparator: Comparisons, value: string): this;
  andLiteral(
    field: string,
    comparator: string | Comparisons,
    value?: string,
  ): this {
    return this.#addLiteral('AND', false, field, comparator, value);
  }
  andNotLiteral(field: string, value: string): this;
  andNotLiteral(field: string, comparator: Comparisons, value: string): this;
  andNotLiteral(
    field: string,
    comparator: Comparisons | string,
    value?: string,
  ): this {
    return this.#addLiteral('AND', true, field, comparator, value);
  }
  orLiteral(field: string, value: string): this;
  orLiteral(field: string, comparator: Comparisons, value: string): this;
  orLiteral(
    field: string,
    comparator: string | Comparisons,
    value?: string,
  ): this {
    return this.#addLiteral('OR', false, field, comparator, value);
  }
  orNotLiteral(field: string, value: string): this;
  orNotLiteral(field: string, comparator: Comparisons, value: string): this;
  orNotLiteral(
    field: string,
    comparator: Comparisons | string,
    value?: string,
  ): this {
    return this.#addLiteral('OR', true, field, comparator, value);
  }
  xorLiteral(field: string, value: string): this;
  xorLiteral(field: string, comparator: Comparisons, value: string): this;
  xorLiteral(
    field: string,
    comparator: string | Comparisons,
    value?: string,
  ): this {
    return this.#addLiteral('XOR', false, field, comparator, value);
  }
  xorNotLiteral(field: string, value: string): this;
  xorNotLiteral(field: string, comparator: Comparisons, value: string): this;
  xorNotLiteral(
    field: string,
    comparator: Comparisons | string,
    value?: string,
  ): this {
    return this.#addLiteral('XOR', true, field, comparator, value);
  }
}

export class WhereClauseStringBuilder
  extends WhereClause
  implements StringBuilder
{
  get numberOfClauses() {
    return this.predicates.length;
  }

  build(): string {
    const prefixString = this.prefix ? `${this.prefix} ` : '';
    return `${prefixString}${this.predicates
      .map((filter) => filter.build())
      .join(' ')}`;
  }
}
function isNullComparator(comparator: unknown): comparator is NullComparison {
  return nullComparison === comparator;
}
