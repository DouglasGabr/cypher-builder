import { CallProcedureClauseStringBuilder } from './clauses/call-procedure.clause';
import { CallClauseStringBuilder } from './clauses/call.clause';
import { CreateClauseStringBuilder } from './clauses/create.clause';
import { DeleteClauseStringBuilder } from './clauses/delete.clause';
import { MatchClauseStringBuilder } from './clauses/match.clause';
import { MergeClauseStringBuilder } from './clauses/merge.clause';
import { OptionalMatchClauseStringBuilder } from './clauses/optional-match.clause';
import {
  OrderByClauseStringBuilder,
  OrderByItem,
} from './clauses/order-by.clause';
import { LimitClauseStringBuilder } from './clauses/pagination-clauses/limit.clause';
import { SkipClauseStringBuilder } from './clauses/pagination-clauses/skip.clause';
import { UsingIndexSeekClauseStringBuilder } from './clauses/planner-hint-clauses/using-index-seek.clause';
import { UsingIndexClauseStringBuilder } from './clauses/planner-hint-clauses/using-index.clause';
import { UsingJoinOnClauseStringBuilder } from './clauses/planner-hint-clauses/using-join-on.clause';
import { UsingScanClauseStringBuilder } from './clauses/planner-hint-clauses/using-scan.clause';
import { ResultClauseStringBuilder } from './clauses/result-clauses/result.clause';
import { ReturnClauseStringBuilder } from './clauses/result-clauses/return.clause';
import { WithClauseStringBuilder } from './clauses/result-clauses/with.clause';
import { YieldClauseStringBuilder } from './clauses/result-clauses/yield.clause';
import { OnCreateClauseStringBuilder } from './clauses/set-clauses/on-create.clause';
import { OnMatchClauseStringBuilder } from './clauses/set-clauses/on-match.clause';
import {
  SetClause,
  SetClauseStringBuilder,
} from './clauses/set-clauses/set.clause';
import { UnionClauseStringBuilder } from './clauses/union.clause';
import { UnwindClauseStringBuilder } from './clauses/unwind.clause';
import { WhereClause, WhereClauseStringBuilder } from './clauses/where.clause';
import { ParametersBag } from './parameters/ParametersBag';
import {
  PatternBuilder,
  PatternStringBuilder,
} from './patterns/PatternBuilder';
import {
  CypherBuilderNodes,
  CypherBuilderRelationships,
} from './types/labels-and-properties';
import { ShouldBeAdded } from './types/should-be-added';
import { StringBuilder } from './types/string-builder';

export type { OrderByDirection, OrderByItem } from './clauses/order-by.clause';
export type { PatternBuilder } from './patterns/PatternBuilder';
export type {
  RelationshipDirection,
  RelationshipLimits,
} from './patterns/Relationship';
export * from './types/labels-and-properties';
export { literal } from './utils/literal';
export type { Literal } from './utils/literal';

type QueryRunnerFunction<T> = (
  query: string,
  parameters?: unknown,
) => Promise<T>;
type QueryRunner<T> = { run: QueryRunnerFunction<T> };

type BuilderParameter<T> = (builder: T) => unknown;

export class Builder {
  private parametersBag = new ParametersBag();
  private clauses: StringBuilder[] = [];
  private indent = 0;

  /**
   * @param pathName path name
   * @param builder pattern builder
   * @see [MATCH](https://neo4j.com/docs/cypher-manual/current/clauses/match/)
   * @see [Assigning to path variables](https://neo4j.com/docs/cypher-manual/current/syntax/patterns/#cypher-pattern-path-variables)
   * @example
   * .match('p', m => {
   *   m.node('person', 'Person')
   * })
   * // MATCH p = (person:Person)
   * @example
   * .match('p', m => {
   *   m.node('a')
   *     .relationship('out', 'KNOWS')
   *     .node('b')
   * })
   * // MATCH p = (a)-[:KNOWS]->(b)
   */
  match(pathName: string, builder: BuilderParameter<PatternBuilder>): this;
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
  match(builder: BuilderParameter<PatternBuilder>): this;
  match(
    a: BuilderParameter<PatternBuilder> | string,
    b?: BuilderParameter<PatternBuilder>,
  ) {
    const { pathName, builder } =
      typeof a === 'string'
        ? { pathName: a, builder: b! }
        : { pathName: undefined, builder: a };
    const patternBuilder = new PatternStringBuilder(
      this.parametersBag,
      pathName,
    );
    builder(patternBuilder);
    const matchClause = new MatchClauseStringBuilder(patternBuilder);
    this.#addClause(matchClause);
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
  optionalMatch(builder: BuilderParameter<PatternBuilder>) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    const optionalMatchClause = new OptionalMatchClauseStringBuilder(
      patternBuilder,
    );
    this.#addClause(optionalMatchClause);
    return this;
  }

  merge(builder: BuilderParameter<PatternBuilder>) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    const mergeClause = new MergeClauseStringBuilder(patternBuilder);
    this.#addClause(mergeClause);
    return this;
  }

  where(builder: BuilderParameter<WhereClause>) {
    const whereBuilder = new WhereClauseStringBuilder(this.parametersBag);
    builder(whereBuilder);
    this.#addClause(whereBuilder);
    return this;
  }

  /**
   * @param builder pattern builder
   * @see [CREATE](https://neo4j.com/docs/cypher-manual/current/clauses/create/)
   * @example
   * .create(c => {
   *   c.node('person', 'Person')
   * })
   * // CREATE (person:Person)
   * @example
   * .create(c => {
   *   c.node('a')
   *     .relationship('out', 'KNOWS')
   *     .node('b')
   * })
   * // CREATE (a)-[:KNOWS]->(b)
   */
  create(builder: BuilderParameter<PatternBuilder>) {
    const patternBuilder = new PatternStringBuilder(this.parametersBag);
    builder(patternBuilder);
    const createClause = new CreateClauseStringBuilder(patternBuilder);
    this.#addClause(createClause);
    return this;
  }

  with(...items: Array<string | [string, string]>): this {
    const withClause = new WithClauseStringBuilder();
    this.addResultClause(items, withClause);
    return this;
  }
  withDistinct(...items: Array<string | [string, string]>): this {
    const withClause = new WithClauseStringBuilder(true);
    this.addResultClause(items, withClause);
    return this;
  }

  return(...items: Array<string | [string, string]>): this {
    const returnClause = new ReturnClauseStringBuilder();
    this.addResultClause(items, returnClause);
    return this;
  }
  returnDistinct(...items: Array<string | [string, string]>): this {
    const returnClause = new ReturnClauseStringBuilder(true);
    this.addResultClause(items, returnClause);
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
    this.#addClause(clause);
  }

  union() {
    this.#addClause(new UnionClauseStringBuilder());
    return this;
  }

  unionAll() {
    this.#addClause(new UnionClauseStringBuilder(true));
    return this;
  }

  skip(skip: number) {
    this.#addClause(new SkipClauseStringBuilder(this.parametersBag, skip));
    return this;
  }

  limit(limit: number) {
    this.#addClause(new LimitClauseStringBuilder(this.parametersBag, limit));
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
    this.#addClause(
      new UnwindClauseStringBuilder(list, as, this.parametersBag),
    );
    return this;
  }

  set(builder: BuilderParameter<SetClause>): this {
    const clause = new SetClauseStringBuilder('SET', this.parametersBag);
    builder(clause);
    this.#addClause(clause);
    return this;
  }
  onMatchSet(builder: BuilderParameter<SetClause>): this {
    const clause = new OnMatchClauseStringBuilder(this.parametersBag);
    builder(clause);
    this.#addClause(clause);
    return this;
  }
  onCreateSet(builder: BuilderParameter<SetClause>): this {
    const clause = new OnCreateClauseStringBuilder(this.parametersBag);
    builder(clause);
    this.#addClause(clause);
    return this;
  }

  #call(
    builder: BuilderParameter<Builder>,
    inTransactions: boolean,
    inTransactionsRowsCount: number | null,
  ): this {
    const internalBuilder = new Builder();
    internalBuilder.parametersBag = this.parametersBag;
    internalBuilder.indent = this.indent + 2;
    builder(internalBuilder);
    const clause = new CallClauseStringBuilder(
      internalBuilder,
      inTransactions,
      inTransactionsRowsCount,
    );
    this.#addClause(clause);
    return this;
  }

  /**
   * The CALL clause is used to call a procedure deployed in the database
   * @see {@link https://neo4j.com/docs/cypher-manual/current/clauses/call/ CALL procedure}
   */
  call(procedure: string): this;
  /**
   * The CALL {} clause evaluates a subquery that returns some values
   * @see {@link https://neo4j.com/docs/cypher-manual/current/clauses/call-subquery/ CALL subquery}
   */
  call(builder: BuilderParameter<Builder>): this;
  call(builderOrProcedure: BuilderParameter<Builder> | string): this {
    if (typeof builderOrProcedure === 'string') {
      const clause = new CallProcedureClauseStringBuilder(builderOrProcedure);
      this.#addClause(clause);
      return this;
    }
    return this.#call(builderOrProcedure, false, null);
  }

  /**
   * @see {@link https://neo4j.com/docs/cypher-manual/current/clauses/call-subquery/#subquery-call-in-transactions CALL IN TRANSACTIONS}
   * @example
   * .callInTransactions(...)
   * // CALL { ... } IN TRANSACTIONS
   */
  callInTransactions(builder: BuilderParameter<Builder>): this;
  /**
   * @see {@link https://neo4j.com/docs/cypher-manual/current/clauses/call-subquery/#_batching CALL IN TRANSACTIONS OF n ROWS}
   * @example
   * .callInTransactions(5, ...)
   * // CALL { ... } IN TRANSACTIONS OF 5 ROWS
   */
  callInTransactions(
    rowCount: number,
    builder: BuilderParameter<Builder>,
  ): this;
  callInTransactions(
    builderOrCount: BuilderParameter<Builder> | number,
    builderFallback?: BuilderParameter<Builder>,
  ): this {
    const [count, builder] =
      typeof builderOrCount === 'number'
        ? [builderOrCount, builderFallback!]
        : [null, builderOrCount];
    return this.#call(builder, true, count);
  }

  /**
   * The YIELD sub-clause is used to explicitly select which of the available
   * result fields are returned as newly-bound variables from the procedure call
   * to the user or for further processing by the remaining query
   * @see {@link https://neo4j.com/docs/cypher-manual/current/clauses/call/#query-call-introduction CALL introduction}
   */
  yield(...items: Array<string | [string, string]>): this {
    const clause = new YieldClauseStringBuilder();
    this.addResultClause(items, clause);
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
    this.#addClause(clause);
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
    this.#addClause(new DeleteClauseStringBuilder(false, items));
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
    this.#addClause(new DeleteClauseStringBuilder(true, items));
    return this;
  }

  /**
   * Add a value to the query parameters
   * @param value value to be provided as a parameter
   * @returns string with the generated parameter name
   */
  addParameter(value: unknown): string;
  /**
   * Add a value to the query parameters
   * @param value value to be provided as a parameter
   * @param alias alias for the parameter (will replace any existing parameter with same alias)
   * @returns Builder instance for method chaining
   */
  addParameter(value: unknown, alias: string): this;
  addParameter(value: unknown, alias?: string): this | string {
    const param = this.parametersBag.add(
      value,
      false,
      alias,
      typeof alias === 'string',
    );
    if (typeof alias === 'undefined') {
      return param;
    }
    return this;
  }

  usingIndex<
    Type extends keyof CypherBuilderRelationships & string,
    Fields extends keyof CypherBuilderRelationships[Type] & string,
  >(variable: string, type: Type, fields: Fields[]): this;
  usingIndex<
    Label extends keyof CypherBuilderNodes & string,
    Fields extends keyof CypherBuilderNodes[Label] & string,
  >(variable: string, label: Label, fields: Fields[]): this;
  usingIndex(variable: string, labelOrType: string, fields: string[]): this {
    const clause = new UsingIndexClauseStringBuilder(
      variable,
      labelOrType,
      fields,
    );
    this.#addClause(clause);
    return this;
  }

  usingIndexSeek<
    Type extends keyof CypherBuilderRelationships & string,
    Fields extends keyof CypherBuilderRelationships[Type] & string,
  >(variable: string, type: Type, fields: Fields[]): this;
  usingIndexSeek<
    Label extends keyof CypherBuilderNodes & string,
    Fields extends keyof CypherBuilderNodes[Label] & string,
  >(variable: string, label: Label, fields: Fields[]): this;
  usingIndexSeek(
    variable: string,
    labelOrType: string,
    fields: string[],
  ): this {
    const clause = new UsingIndexSeekClauseStringBuilder(
      variable,
      labelOrType,
      fields,
    );
    this.#addClause(clause);
    return this;
  }

  usingScan<Type extends keyof CypherBuilderRelationships & string>(
    variable: string,
    type: Type,
  ): this;
  usingScan<Label extends keyof CypherBuilderNodes & string>(
    variable: string,
    label: Label,
  ): this;
  usingScan(variable: string, labelOrType: string): this {
    const clause = new UsingScanClauseStringBuilder(variable, labelOrType);
    this.#addClause(clause);
    return this;
  }

  usingJoinOn(variable: string): this {
    const clause = new UsingJoinOnClauseStringBuilder(variable);
    this.#addClause(clause);
    return this;
  }

  #addClause(clause: ShouldBeAdded & StringBuilder) {
    if (clause.__shouldBeAdded) {
      this.clauses.push(clause);
    }
  }

  build(): string {
    return this.clauses
      .map((c) => ''.padStart(this.indent, ' ') + c.build())
      .join('\n');
  }

  buildQueryObject() {
    return {
      query: this.build(),
      parameters: this.parametersBag.toParametersObject(),
    };
  }

  run<T>(runner: QueryRunner<T>): Promise<T>;
  /**
   * @deprecated use `run(runner: QueryRunner<T>)` instead
   */
  run<T>(runnerFn: QueryRunnerFunction<T>): Promise<T>;
  async run<T>(runner: QueryRunnerFunction<T> | QueryRunner<T>) {
    const { query, parameters } = this.buildQueryObject();
    if (typeof runner === 'function') {
      return runner(query, parameters);
    } else {
      return runner.run(query, parameters);
    }
  }
}
