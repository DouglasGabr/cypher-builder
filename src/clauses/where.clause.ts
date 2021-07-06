import { StringBuilder } from '../BaseBuilder';
import { ParametersBag } from '../ParametersBag';
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

class Comp implements StringBuilder {
  constructor(
    private comp: string,
    private field: string,
    private value: string,
  ) {}

  build() {
    return `${this.field} ${this.comp} ${this.value}`;
  }
}

class Raw implements StringBuilder {
  constructor(private raw: string) {}
  build() {
    return this.raw;
  }
}

class WhereItem implements StringBuilder {
  constructor(
    private prefix: 'AND' | 'OR' | 'XOR',
    private clause: StringBuilder,
    private not: boolean = false,
    private shouldAddPrefix: boolean = false,
    private shouldAddParenthesis: boolean = false,
  ) {}

  build() {
    const [leftP, rightP] = this.shouldAddParenthesis
      ? (['(', ')'] as const)
      : (['', ''] as const);
    const prefixString = this.shouldAddPrefix ? `${this.prefix} ` : '';
    const notString = this.not ? 'NOT ' : '';
    return `${prefixString}${notString}${leftP}${this.clause.build()}${rightP}`;
  }
}

export class WhereClause {
  protected prefix: 'WHERE' | '';
  protected parametersBag: ParametersBag;
  protected clauses: StringBuilder[] = [];
  constructor(parametersBag?: ParametersBag, prefix: 'WHERE' | '' = '') {
    this.parametersBag = parametersBag ?? new ParametersBag();
    this.prefix = prefix;
  }

  private _and(builder: StringBuilder, not?: boolean): this {
    this.clauses.push(
      new WhereItem(
        'AND',
        builder,
        not,
        this.clauses.length > 0,
        builder instanceof WhereClauseStringBuilder
          ? builder.numberOfClauses > 1
          : false,
      ),
    );
    return this;
  }

  andNotWhere(builder: (whereBuilder: WhereClause) => any): this {
    return this._andWhere(builder, true);
  }
  andWhere(builder: (whereBuilder: WhereClause) => any): this {
    return this._andWhere(builder, false);
  }

  private _andWhere(builder: (whereBuilder: WhereClause) => any, not: boolean) {
    const whereBuilder = new WhereClauseStringBuilder(this.parametersBag);
    builder(whereBuilder);
    return this._and(whereBuilder, not);
  }

  andNotPattern(builder: (patternBuilder: PatternBuilder) => any): this {
    return this._addPattern(builder, true);
  }
  andPattern(builder: (patternBuilder: PatternBuilder) => any): this {
    return this._addPattern(builder, false);
  }

  private _addPattern(
    builder: (patternBuilder: PatternBuilder) => any,
    not: boolean,
  ) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    return this._and(patternBuilder, not);
  }

  and(field: string, value: any): this;
  and(field: string, comparator: Comparisons, value: any): this;
  and(field: string, comparator: any, value?: any): this {
    let _value: any;
    let _comparator: Comparisons;
    if (typeof value === 'undefined') {
      _comparator = '=';
      _value = comparator;
    } else {
      _comparator = comparator;
      _value = value;
    }
    const comp = new Comp(
      _comparator,
      field,
      this.parametersBag.add(_value, true),
    );
    return this._and(comp, false);
  }
}

export class WhereClauseStringBuilder
  extends WhereClause
  implements StringBuilder
{
  get numberOfClauses() {
    return this.clauses.length;
  }

  build(): string {
    const prefixString = this.prefix ? `${this.prefix} ` : '';
    return `${prefixString}${this.clauses
      .map((clause) => clause.build())
      .join(' ')}`;
  }
}
