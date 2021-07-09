import { StringBuilder } from '../../BaseBuilder';

type ResultClausePrefix = 'RETURN' | 'WITH';

class ResultItem implements StringBuilder {
  constructor(private value: string | StringBuilder, private alias?: string) {}
  build(): string {
    const valueString =
      typeof this.value === 'string' ? this.value : this.value.build();
    return this.alias ? `${valueString} AS ${this.alias}` : valueString;
  }
}

export abstract class ResultClause {
  protected items: StringBuilder[] = [];
  constructor(protected prefix: ResultClausePrefix) {}

  add(value: string | StringBuilder, alias?: string): this {
    this.items.push(new ResultItem(value, alias));
    return this;
  }
}

export abstract class ResultClauseStringBuilder
  extends ResultClause
  implements StringBuilder
{
  build(): string {
    return `${this.prefix} ${this.items
      .map((item) => item.build())
      .join(', ')}`;
  }
}
