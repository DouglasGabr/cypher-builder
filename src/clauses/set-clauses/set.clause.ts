import { CypherBuilderNodes } from '../..';
import { ParametersBag } from '../../parameters/ParametersBag';
import { StringBuilder } from '../../types/string-builder';

interface ISetUpdate extends StringBuilder {
  __type: 'ISetUpdate';
}

type FieldSetUpdateOperator = '=' | '+=';

class FieldSetUpdate implements ISetUpdate {
  __type = 'ISetUpdate' as const;
  constructor(
    private updated: string,
    private value: string,
    private operator: FieldSetUpdateOperator,
  ) {}
  build(): string {
    return `${this.updated} ${this.operator} ${this.value}`;
  }
}

class LabelSetUpdate implements ISetUpdate {
  __type = 'ISetUpdate' as const;
  constructor(private node: string, private labels: string[]) {}
  build(): string {
    return `${this.node}:${this.labels.join(':')}`;
  }
}

export class SetClause {
  protected updates: ISetUpdate[] = [];

  constructor(private parametersBag = new ParametersBag()) {}

  set(
    updated: string,
    value: unknown,
    operator: FieldSetUpdateOperator = '=',
  ): this {
    this.updates.push(
      new FieldSetUpdate(
        updated,
        this.parametersBag.add(value, true, updated),
        operator,
      ),
    );
    return this;
  }

  setLiteral(
    updated: string,
    value: string,
    operator: FieldSetUpdateOperator = '=',
  ): this {
    this.updates.push(new FieldSetUpdate(updated, value, operator));
    return this;
  }

  setLabels<T extends keyof CypherBuilderNodes & string>(
    node: string,
    labels: T | T[],
  ): this {
    this.updates.push(
      new LabelSetUpdate(node, Array.isArray(labels) ? labels : [labels]),
    );
    return this;
  }
}

export class SetClauseStringBuilder extends SetClause implements StringBuilder {
  build(): string {
    return 'SET ' + this.updates.map((u) => u.build()).join(', ');
  }
}
