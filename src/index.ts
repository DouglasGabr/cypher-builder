import { StringBuilder } from './BaseBuilder';
import { MatchClause, MatchClauseStringBuilder } from './clauses/match.clause';
import { MergeClause, MergeClauseStringBuilder } from './clauses/merge.clause';
import { UnionClauseStringBuilder } from './clauses/union.clause';
import { WhereClause, WhereClauseStringBuilder } from './clauses/where.clause';
import { ParametersBag } from './parameters/ParametersBag';
export * from './CypherBuilderTypes';

type QueryRunner<T> = (query: string, parameters?: any) => Promise<T>;

export {
  RelationshipDirection,
  RelationshipLimits,
} from './patterns/Relationship';

export class Builder {
  private parametersBag = new ParametersBag();
  private clauses: StringBuilder[] = [];

  match(builder: (patternBuilder: MatchClause) => any) {
    const patternBuilder = new MatchClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  merge(builder: (patternBuilder: MergeClause) => any) {
    const patternBuilder = new MergeClauseStringBuilder(this.parametersBag);
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  where(builder: (whereBuilder: WhereClause) => any) {
    const whereBuilder = new WhereClauseStringBuilder(
      this.parametersBag,
      'WHERE',
    );
    builder(whereBuilder);
    this.clauses.push(whereBuilder);
    return this;
  }

  union() {
    this.clauses.push(new UnionClauseStringBuilder());
    return this;
  }

  unionAll() {
    this.clauses.push(new UnionClauseStringBuilder(true));
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
