import { CypherBuilderNodes } from '../..';
import { ParametersBag } from '../../parameters/ParametersBag';
import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';

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

type SetClausePrefix = 'SET' | 'ON CREATE SET' | 'ON MATCH SET';

export abstract class SetClause extends Clause {
  protected updates: ISetUpdate[] = [];

  constructor(prefix: SetClausePrefix, private parametersBag: ParametersBag) {
    super(prefix);
  }

  /**
   * @example
   * .set('user.name', 'New Name')
   * // user.name = $user_name
   * // $user_name => 'New Name'
   * .set('user', { name: 'New Name' }, '+=')
   * // user += $user
   * // $user => { name: 'New Name' }
   */
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

  /**
   * @example
   * .setLiteral('user.lastName', 'parent.lastName')
   * // user.lastName = parent.lastName
   * .setLiteral('clone', 'user', '+=')
   * // clone += user
   */
  setLiteral(
    updated: string,
    value: string,
    operator: FieldSetUpdateOperator = '=',
  ): this {
    this.updates.push(new FieldSetUpdate(updated, value, operator));
    return this;
  }

  /**
   * @example
   * .setLabels('user', 'Admin')
   * // user:Admin
   * @example
   * .setLabels('user', ['Admin', 'Adult'])
   * // user:Admin:Adult
   */
  setLabels<Label extends keyof CypherBuilderNodes & string>(
    node: string,
    labels: Label | Label[],
  ): this {
    this.updates.push(
      new LabelSetUpdate(node, Array.isArray(labels) ? labels : [labels]),
    );
    return this;
  }
}

export class SetClauseStringBuilder
  extends SetClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.updates.length > 0;
  }
  build(): string {
    return `${this.prefix} ${this.updates.map((u) => u.build()).join(', ')}`;
  }
}
