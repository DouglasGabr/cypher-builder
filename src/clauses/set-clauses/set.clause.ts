import { CypherBuilderNodes } from '../..';
import { ParametersBag } from '../../parameters/ParametersBag';
import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';
import { Literal } from '../../utils/literal';
import { SetOptions, Variables } from '../../utils/variable-types';

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

export abstract class SetClause<TVariables extends Variables> extends Clause {
  protected updates: ISetUpdate[] = [];

  constructor(prefix: SetClausePrefix, private parametersBag: ParametersBag) {
    super(prefix);
  }

  /**
   * @example
   * .set('user.name', 'New Name')
   * // user.name = $user_name
   * // $user_name => 'New Name'
   * .set('user.name', literal('otherName'))
   * // user.name = otherName
   */
  set<Key extends keyof SetOptions<TVariables>>(
    key: Key,
    value: SetOptions<TVariables>[Key],
  ): this;
  /**
   * @example
   * .set('user', '+=', { name: 'New Name' })
   * // user += $user
   * // $user => { name: 'New Name' }
   * .set('user', '+=', literal('otherUser'))
   * // user += otherName
   */
  set<Key extends keyof SetOptions<TVariables> & string>(
    key: Key,
    operator: FieldSetUpdateOperator,
    value: SetOptions<TVariables>[Key],
  ): this;
  set<Key extends keyof SetOptions<TVariables> & string>(
    key: Key,
    operatorOrValue: FieldSetUpdateOperator | SetOptions<TVariables>[Key],
    valueWhenOperatorIsUsed?: SetOptions<TVariables>[Key],
  ): this {
    const { operator, value } =
      typeof valueWhenOperatorIsUsed === 'undefined'
        ? {
            operator: '=' as FieldSetUpdateOperator,
            value: operatorOrValue as SetOptions<TVariables>[Key],
          }
        : {
            operator: operatorOrValue as FieldSetUpdateOperator,
            value: valueWhenOperatorIsUsed!,
          };
    this.updates.push(
      new FieldSetUpdate(
        key as string,
        value instanceof Literal
          ? value.value
          : this.parametersBag.add(value, true, key as string),
        operator,
      ),
    );
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

export class SetClauseStringBuilder<TVariables extends Variables>
  extends SetClause<TVariables>
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.updates.length > 0;
  }
  build(): string {
    return `${this.prefix} ${this.updates.map((u) => u.build()).join(', ')}`;
  }
}
