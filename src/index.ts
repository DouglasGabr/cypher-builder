import { StringBuilder } from './BaseBuilder';
import { ParametersBag } from './ParametersBag';
import { Pattern, PatternBuilder } from './patterns/PatternBuilder';
export * from './CypherBuilderTypes';

export {
  RelationshipDirection,
  RelationshipLimits,
} from './patterns/Relationship';

export class Builder {
  private parametersBag = new ParametersBag();
  private clauses: StringBuilder[] = [];

  match(builder: (patternBuilder: Pattern) => any) {
    const patternBuilder = new PatternBuilder(this.parametersBag, 'MATCH ');
    builder(patternBuilder);
    this.clauses.push(patternBuilder);
    return this;
  }

  build(): string {
    return this.clauses.map((c) => c.build()).join('\n');
  }
}
