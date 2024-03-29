import { StringBuilder } from '../types/string-builder';
import { ParametersBag } from '../parameters/ParametersBag';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';
import { CypherBuilderNodes } from '..';
import { Clause } from './base-clause';
import { ShouldBeAdded } from '../types/should-be-added';
import { Literal } from '../utils/literal';

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

type NullComparison = 'IS NULL' | 'IS NOT NULL';
const nullComparisons: NullComparison[] = ['IS NULL', 'IS NOT NULL'];

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

class LabelComparator implements StringBuilder {
  constructor(private alias: string, private labels: string[]) {}

  build() {
    return `${this.alias}:${this.labels.join(':')}`;
  }
}

const predicateFunctionNames = ['all', 'any', 'none', 'single'] as const;
type PredicateFunctionName = typeof predicateFunctionNames[number];
class PredicateFunctionComparator implements StringBuilder {
  constructor(
    private functionName: PredicateFunctionName,
    private variable: string,
    private list: string,
    private where: WhereClauseStringBuilder,
  ) {}
  build(): string {
    return `${this.functionName}(${this.variable} IN ${
      this.list
    } ${this.where.build()})`;
  }
}

class ExistsComparator implements StringBuilder {
  constructor(private variable: string | PatternStringBuilder) {}
  build(): string {
    return `exists(${
      typeof this.variable === 'string' ? this.variable : this.variable.build()
    })`;
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
export abstract class WhereClause extends Clause {
  protected predicates: StringBuilder[] = [];

  constructor(
    private parametersBag: ParametersBag,
    protected withPrefix = true,
  ) {
    super('WHERE');
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
    const whereBuilder = new WhereClauseStringBuilder(
      this.parametersBag,
      false,
    );
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
    not: boolean,
    builder: (patternBuilder: PatternBuilder) => unknown,
  ) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    return this.#addPredicate(prefix, patternBuilder, not);
  }

  andPattern = this.#addPattern.bind(this, 'AND', false);
  andNotPattern = this.#addPattern.bind(this, 'AND', true);
  orPattern = this.#addPattern.bind(this, 'OR', false);
  orNotPattern = this.#addPattern.bind(this, 'OR', true);
  xorPattern = this.#addPattern.bind(this, 'XOR', false);
  xorNotPattern = this.#addPattern.bind(this, 'XOR', true);

  #add(
    prefix: PredicatePrefix,
    not: boolean,
    field: string,
    comparator: unknown,
    value?: unknown | Literal,
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
      _value instanceof Literal
        ? _value.value
        : this.parametersBag.add(_value, true, field),
    );
    return this.#addPredicate(prefix, comp, not);
  }

  andNot(field: string, value: unknown | Literal): this;
  andNot(field: string, nullComparison: NullComparison): this;
  andNot(
    field: string,
    comparator: Comparisons,
    value: unknown | Literal,
  ): this;
  andNot(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('AND', true, field, comparator, value);
  }
  and(field: string, value: unknown | Literal): this;
  and(field: string, nullComparison: NullComparison): this;
  and(field: string, comparator: Comparisons, value: unknown | Literal): this;
  and(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('AND', false, field, comparator, value);
  }
  orNot(field: string, value: unknown | Literal): this;
  orNot(field: string, nullComparison: NullComparison): this;
  orNot(field: string, comparator: Comparisons, value: unknown | Literal): this;
  orNot(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('OR', true, field, comparator, value);
  }
  or(field: string, value: unknown | Literal): this;
  or(field: string, nullComparison: NullComparison): this;
  or(field: string, comparator: Comparisons, value: unknown | Literal): this;
  or(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('OR', false, field, comparator, value);
  }
  xorNot(field: string, value: unknown | Literal): this;
  xorNot(field: string, nullComparison: NullComparison): this;
  xorNot(
    field: string,
    comparator: Comparisons,
    value: unknown | Literal,
  ): this;
  xorNot(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('XOR', true, field, comparator, value);
  }
  xor(field: string, value: unknown | Literal): this;
  xor(field: string, nullComparison: NullComparison): this;
  xor(field: string, comparator: Comparisons, value: unknown | Literal): this;
  xor(field: string, comparator: unknown, value?: unknown | Literal): this {
    return this.#add('XOR', false, field, comparator, value);
  }

  #addLabel(
    prefix: PredicatePrefix,
    not: boolean,
    alias: string,
    labels: string | string[],
  ): this {
    this.#addPredicate(
      prefix,
      new LabelComparator(
        alias,
        typeof labels === 'string' ? [labels] : labels,
      ),
      not,
    );
    return this;
  }
  andLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('AND', false, alias, labels);
  }
  andNotLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('AND', true, alias, labels);
  }
  orLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('OR', false, alias, labels);
  }
  orNotLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('OR', true, alias, labels);
  }
  xorLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('XOR', false, alias, labels);
  }
  xorNotLabel<Label extends keyof CypherBuilderNodes & string>(
    alias: string,
    labels: Label | Label[],
  ): this {
    return this.#addLabel('XOR', true, alias, labels);
  }

  #addPredicateFunction(
    prefix: PredicatePrefix,
    not: boolean,
    functionName: PredicateFunctionName,
    variable: string,
    list: string,
    builder: (whereBuilder: WhereClause) => unknown,
  ): this {
    const whereBuilder = new WhereClauseStringBuilder(this.parametersBag, true);
    builder(whereBuilder);
    return this.#addPredicate(
      prefix,
      new PredicateFunctionComparator(
        functionName,
        variable as string,
        list,
        whereBuilder,
      ),
      not,
    );
  }

  andAll = this.#addPredicateFunction.bind(this, 'AND', false, 'all');
  andNotAll = this.#addPredicateFunction.bind(this, 'AND', true, 'all');
  orAll = this.#addPredicateFunction.bind(this, 'OR', false, 'all');
  orNotAll = this.#addPredicateFunction.bind(this, 'OR', true, 'all');
  xorAll = this.#addPredicateFunction.bind(this, 'XOR', false, 'all');
  xorNotAll = this.#addPredicateFunction.bind(this, 'XOR', true, 'all');
  andAny = this.#addPredicateFunction.bind(this, 'AND', false, 'any');
  andNotAny = this.#addPredicateFunction.bind(this, 'AND', true, 'any');
  orAny = this.#addPredicateFunction.bind(this, 'OR', false, 'any');
  orNotAny = this.#addPredicateFunction.bind(this, 'OR', true, 'any');
  xorAny = this.#addPredicateFunction.bind(this, 'XOR', false, 'any');
  xorNotAny = this.#addPredicateFunction.bind(this, 'XOR', true, 'any');
  andNone = this.#addPredicateFunction.bind(this, 'AND', false, 'none');
  andNotNone = this.#addPredicateFunction.bind(this, 'AND', true, 'none');
  orNone = this.#addPredicateFunction.bind(this, 'OR', false, 'none');
  orNotNone = this.#addPredicateFunction.bind(this, 'OR', true, 'none');
  xorNone = this.#addPredicateFunction.bind(this, 'XOR', false, 'none');
  xorNotNone = this.#addPredicateFunction.bind(this, 'XOR', true, 'none');
  andSingle = this.#addPredicateFunction.bind(this, 'AND', false, 'single');
  andNotSingle = this.#addPredicateFunction.bind(this, 'AND', true, 'single');
  orSingle = this.#addPredicateFunction.bind(this, 'OR', false, 'single');
  orNotSingle = this.#addPredicateFunction.bind(this, 'OR', true, 'single');
  xorSingle = this.#addPredicateFunction.bind(this, 'XOR', false, 'single');
  xorNotSingle = this.#addPredicateFunction.bind(this, 'XOR', true, 'single');

  #addExists(
    prefix: PredicatePrefix,
    not: boolean,
    variable: string | ((patternBuilder: PatternBuilder) => unknown),
  ): this {
    let _variable: string | PatternStringBuilder;
    if (typeof variable === 'string') {
      _variable = variable;
    } else {
      _variable = new PatternStringBuilder(this.parametersBag);
      variable(_variable);
    }
    return this.#addPredicate(prefix, new ExistsComparator(_variable), not);
  }

  andExists = this.#addExists.bind(this, 'AND', false);
  andNotExists = this.#addExists.bind(this, 'AND', true);
  orExists = this.#addExists.bind(this, 'OR', false);
  orNotExists = this.#addExists.bind(this, 'OR', true);
  xorExists = this.#addExists.bind(this, 'XOR', false);
  xorNotExists = this.#addExists.bind(this, 'XOR', true);
}

export class WhereClauseStringBuilder
  extends WhereClause
  implements StringBuilder, ShouldBeAdded
{
  get numberOfClauses() {
    return this.predicates.length;
  }

  get __shouldBeAdded() {
    return this.predicates.length > 0;
  }

  build(): string {
    const prefixString = this.withPrefix ? `${this.prefix} ` : '';
    return `${prefixString}${this.predicates
      .map((filter) => filter.build())
      .join(' ')}`;
  }
}
function isNullComparator(comparator: unknown): comparator is NullComparison {
  return (
    typeof comparator === 'string' &&
    nullComparisons.includes(comparator as NullComparison)
  );
}
