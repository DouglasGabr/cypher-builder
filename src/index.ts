import { StringBuilder } from './types/string-builder';
import { MatchClause, MatchClauseStringBuilder } from './clauses/match.clause';
import { MergeClause, MergeClauseStringBuilder } from './clauses/merge.clause';
import { ResultClauseStringBuilder } from './clauses/result-clauses/result.clause';
import { ReturnClauseStringBuilder } from './clauses/result-clauses/return.clause';
import { WithClauseStringBuilder } from './clauses/result-clauses/with.clause';
import { UnionClauseStringBuilder } from './clauses/union.clause';
import { WhereClause, WhereClauseStringBuilder } from './clauses/where.clause';
import { ParametersBag } from './parameters/ParametersBag';
import { SkipClauseStringBuilder } from './clauses/pagination-clauses/skip.clause';
import { LimitClauseStringBuilder } from './clauses/pagination-clauses/limit.clause';
import {
  OptionalMatchClause,
  OptionalMatchClauseStringBuilder,
} from './clauses/optional-match.clause';
import { UnwindClauseStringBuilder } from './clauses/unwind.clause';
export * from './types/labels-and-properties';

type QueryRunner<T> = (query: string, parameters?: unknown) => Promise<T>;

export { RelationshipDirection } from './patterns/Relationship';

export type { RelationshipLimits } from './patterns/Relationship';

export type { PatternBuilder } from './patterns/PatternBuilder';

export class Builder {
  private parametersBag = new ParametersBag();
  private clauses: StringBuilder[] = [];

  match(builder: (patternBuilder: MatchClause) => unknown) {
    const patternBuilder = new MatchClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  optionalMatch(builder: (patternBuilder: OptionalMatchClause) => unknown) {
    const patternBuilder = new OptionalMatchClauseStringBuilder(
      this.parametersBag,
    );
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  merge(builder: (patternBuilder: MergeClause) => unknown) {
    const patternBuilder = new MergeClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  where(builder: (whereBuilder: WhereClause) => unknown) {
    const whereBuilder = new WhereClauseStringBuilder(
      this.parametersBag,
      'WHERE',
    );
    builder(whereBuilder);
    this.clauses.push(whereBuilder);
    return this;
  }

  with(...args: Array<string | [string, string]>): this {
    const withClause = new WithClauseStringBuilder();
    this.addResultClause(args, withClause);
    return this;
  }
  withDistinct(...args: Array<string | [string, string]>): this {
    const withClause = new WithClauseStringBuilder(true);
    this.addResultClause(args, withClause);
    return this;
  }

  return(...args: Array<string | [string, string]>): this {
    const returnClause = new ReturnClauseStringBuilder();
    this.addResultClause(args, returnClause);
    return this;
  }
  returnDistinct(...args: Array<string | [string, string]>): this {
    const returnClause = new ReturnClauseStringBuilder(true);
    this.addResultClause(args, returnClause);
    return this;
  }

  private addResultClause(
    args: Array<string | [string, string]>,
    clause: ResultClauseStringBuilder,
  ) {
    args.forEach((arg) => {
      const [value, alias] = typeof arg === 'string' ? [arg, undefined] : arg;
      clause.add(value, alias);
    });
    this.clauses.push(clause);
  }

  union() {
    this.clauses.push(new UnionClauseStringBuilder());
    return this;
  }

  unionAll() {
    this.clauses.push(new UnionClauseStringBuilder(true));
    return this;
  }

  skip(skip: number) {
    this.clauses.push(new SkipClauseStringBuilder(this.parametersBag, skip));
    return this;
  }

  limit(limit: number) {
    this.clauses.push(new LimitClauseStringBuilder(this.parametersBag, limit));
    return this;
  }

  unwind(list: Array<unknown> | string, as: string): this {
    this.clauses.push(
      new UnwindClauseStringBuilder(list, as, this.parametersBag),
    );
    return this;
  }

  build(): string {
    return this.clauses.map((c) => c.build()).join('\n');
  }

  buildQueryObject() {
    return {
      query: this.build(),
      parameters: this.parametersBag.toParametersObject(),
    };
  }

  run<T>(runner: QueryRunner<T>) {
    const { query, parameters } = this.buildQueryObject();
    return runner(query, parameters);
  }
}
