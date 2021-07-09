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

type NullComparisons = 'IS NULL' | 'IS NOT NULL';
const nullComparisons: NullComparisons[] = ['IS NULL', 'IS NOT NULL'];

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
  constructor(private nullComparator: NullComparisons, private field: string) {}

  build() {
    return `${this.field} ${this.nullComparator}`;
  }
}

class WherePredicate implements StringBuilder {
  constructor(
    private prefix: 'AND' | 'OR' | 'XOR',
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

export class WhereClause {
  protected prefix: 'WHERE' | '';
  protected parametersBag: ParametersBag;
  protected predicates: StringBuilder[] = [];
  constructor(parametersBag?: ParametersBag, prefix: 'WHERE' | '' = '') {
    this.parametersBag = parametersBag ?? new ParametersBag();
    this.prefix = prefix;
  }

  private _addFilter(
    prefix: 'AND' | 'OR' | 'XOR',
    builder: StringBuilder,
    not: boolean,
  ) {
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

  andNotWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this._andWhere(builder, true);
  }
  andWhere(builder: (whereBuilder: WhereClause) => unknown): this {
    return this._andWhere(builder, false);
  }

  private _andWhere(
    builder: (whereBuilder: WhereClause) => unknown,
    not: boolean,
  ) {
    const whereBuilder = new WhereClauseStringBuilder(this.parametersBag);
    builder(whereBuilder);
    return this._addFilter('AND', whereBuilder, not);
  }

  andNotPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this._addPattern('AND', builder, true);
  }
  andPattern(builder: (patternBuilder: PatternBuilder) => unknown): this {
    return this._addPattern('AND', builder, false);
  }

  private _addPattern(
    prefix: 'AND' | 'OR' | 'XOR',
    builder: (patternBuilder: PatternBuilder) => unknown,
    not: boolean,
  ) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    return this._addFilter(prefix, patternBuilder, not);
  }

  andNot(field: string, value: unknown): this;
  andNot(field: string, nullComparison: NullComparisons): this;
  andNot(field: string, comparator: Comparisons, value: unknown): this;
  andNot(field: string, comparator: unknown, value?: unknown): this {
    if (isNullComparator(comparator)) {
      const comp = new NullComparator(comparator, field);
      return this._addFilter('AND', comp, true);
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
      this.parametersBag.add(_value, true),
    );
    return this._addFilter('AND', comp, true);
  }

  and(field: string, value: unknown): this;
  and(field: string, nullComparison: NullComparisons): this;
  and(field: string, comparator: Comparisons, value: unknown): this;
  and(field: string, comparator: unknown, value?: unknown): this {
    if (isNullComparator(comparator)) {
      const comp = new NullComparator(comparator, field);
      return this._addFilter('AND', comp, false);
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
      this.parametersBag.add(_value, true),
    );
    return this._addFilter('AND', comp, false);
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
function isNullComparator(comparator: unknown): comparator is NullComparisons {
  return nullComparisons.includes(comparator as NullComparisons);
}
