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
import {
  SetClause,
  SetClauseStringBuilder,
} from './clauses/set-clauses/set.clause';
import {
  OnMatchClause,
  OnMatchClauseStringBuilder,
} from './clauses/set-clauses/on-match.clause';
import {
  OnCreateClause,
  OnCreateClauseStringBuilder,
} from './clauses/set-clauses/on-create.clause';
import {
  OrderByClauseStringBuilder,
  OrderByItem,
} from './clauses/order-by.clause';
import { DeleteClauseStringBuilder } from './clauses/delete.clause';
export * from './types/labels-and-properties';

type QueryRunner<T> = (query: string, parameters?: unknown) => Promise<T>;

export type {
  RelationshipLimits,
  RelationshipDirection,
} from './patterns/Relationship';
export type { PatternBuilder } from './patterns/PatternBuilder';
export type { OrderByDirection, OrderByItem } from './clauses/order-by.clause';

type BuilderParameter<T> = (builder: T) => unknown;

export class Builder {
  private parametersBag = new ParametersBag();
  private clauses: StringBuilder[] = [];

  /**
   * @param builder pattern builder
   * @see [MATCH](https://neo4j.com/docs/cypher-manual/current/clauses/match/)
   * @example
   * .match(m => {
   *   m.node('person', 'Person')
   * })
   * // MATCH (person:Person)
   * @example
   * .match(m => {
   *   m.node('a')
   *     .relationship('out', 'KNOWS')
   *     .node('b')
   * })
   * // MATCH (a)-[:KNOWS]->(b)
   */
  match(builder: BuilderParameter<MatchClause>) {
    const patternBuilder = new MatchClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  /**
   * @param builder pattern builder
   * @see [OPTIONAL MATCH](https://neo4j.com/docs/cypher-manual/current/clauses/optional-match/)
   * @example
   * .optionalMatch(m => {
   *   m.node('person', 'Person')
   * })
   * // OPTIONAL MATCH (person:Person)
   * @example
   * .optionalMatch(m => {
   *   m.node('a')
   *     .relationship('out', 'KNOWS')
   *     .node('b')
   * })
   * // OPTIONAL MATCH (a)-[:KNOWS]->(b)
   */
  optionalMatch(builder: BuilderParameter<OptionalMatchClause>) {
    const patternBuilder = new OptionalMatchClauseStringBuilder(
      this.parametersBag,
    );
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  merge(builder: BuilderParameter<MergeClause>) {
    const patternBuilder = new MergeClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  where(builder: BuilderParameter<WhereClause>) {
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

  /**
   * @param list array to be provided as a parameter
   * @param as new variable for each item
   * @see [UNWIND](https://neo4j.com/docs/cypher-manual/current/clauses/unwind/)
   * @example
   * .unwind([1, 2, 3], 'item')
   * // UNWIND $item AS item
   * // $item => [1, 2, 3]
   */
  unwind(list: Array<unknown>, as: string): this;
  /**
   * @param list reference to a list that was already declared in the query
   * @param as new variable for each item
   * @see [UNWIND](https://neo4j.com/docs/cypher-manual/current/clauses/unwind/)
   * @example
   * .unwind('array', 'item')
   * // UNWIND array AS item
   */
  unwind(list: string, as: string): this;
  unwind(list: Array<unknown> | string, as: string): this {
    this.clauses.push(
      new UnwindClauseStringBuilder(list, as, this.parametersBag),
    );
    return this;
  }

  set(builder: BuilderParameter<SetClause>): this {
    const clause = new SetClauseStringBuilder(this.parametersBag);
    builder(clause);
    this.clauses.push(clause);
    return this;
  }
  onMatchSet(builder: BuilderParameter<OnMatchClause>): this {
    const clause = new OnMatchClauseStringBuilder(this.parametersBag);
    builder(clause);
    this.clauses.push(clause);
    return this;
  }
  onCreateSet(builder: BuilderParameter<OnCreateClause>): this {
    const clause = new OnCreateClauseStringBuilder(this.parametersBag);
    builder(clause);
    this.clauses.push(clause);
    return this;
  }

  /**
   * @param items items to order by
   * @see [ORDER BY](https://neo4j.com/docs/cypher-manual/current/clauses/order-by/)
   * @example
   * .orderBy('person.name')
   * // ORDER BY person.name
   * @example
   * .orderBy(['person.name', 'DESC'], 'person.createdAt')
   * // ORDER BY person.name DESC, person.createdAt
   */
  orderBy(...items: OrderByItem[]): this {
    const clause = new OrderByClauseStringBuilder(items);
    this.clauses.push(clause);
    return this;
  }

  /**
   * @param items items to delete
   * @see [DELETE](https://neo4j.com/docs/cypher-manual/current/clauses/delete/)
   * @example
   * .delete('node1')
   * // DELETE node1
   */
  delete(...items: string[]): this {
    this.clauses.push(new DeleteClauseStringBuilder(false, items));
    return this;
  }
  /**
   * @param items items to detach and delete
   * @see [Delete a node with all its relationships](https://neo4j.com/docs/cypher-manual/current/clauses/delete/#delete-delete-a-node-with-all-its-relationships)
   * @example
   * .detachDelete('node1')
   * // DETACH DELETE node1
   */
  detachDelete(...items: string[]): this {
    this.clauses.push(new DeleteClauseStringBuilder(true, items));
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
