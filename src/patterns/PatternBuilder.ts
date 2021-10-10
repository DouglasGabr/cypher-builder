import { StringBuilder } from '../types/string-builder';
import { Node } from './Node';
import { ParametersBag } from '../parameters/ParametersBag';
import {
  CypherBuilderNodes,
  CypherBuilderRelationships,
} from '../types/labels-and-properties';
import {
  Relationship,
  RelationshipDirection,
  RelationshipLimits,
} from './Relationship';
import { ShouldBeAdded } from '../types/should-be-added';

/**
 * @see [Patterns](https://neo4j.com/docs/cypher-manual/current/syntax/patterns/)
 */
export class PatternBuilder {
  protected patterns: StringBuilder[] = [];
  constructor(protected parametersBag: ParametersBag) {}

  /**
   * @example
   * .node()
   * // ()
   * @example
   * .node('user')
   * // (user)
   * @example
   * .node('user', 'User')
   * // (user:User)
   * @example
   * .node('user', ['User', 'Admin'])
   * // (user:User:Admin)
   * @example
   * .node('user', 'User', { name: 'Admin' })
   * // (user:User{ name: $user_name })
   * // $user_name => 'Admin'
   * @example
   * .node('user', ['User', 'Admin'], { name: 'Admin' })
   * // (user:User:Admin{ name: $user_name })
   * // $user_name => 'Admin'
   * @example
   * .node('user', undefined, { name: 'Admin' })
   * // (user{ name: $user_name })
   * // $user_name => 'Admin'
   * @example
   * .node(undefined, 'User')
   * // (:User)
   * @example
   * .node(undefined, ['User', 'Admin'])
   * // (:User:Admin)
   * @example
   * .node(undefined, 'User', { name: 'Admin' })
   * // (:User{ name: $name })
   * // $name => 'Admin'
   * @example
   * .node(undefined, ['User', 'Admin'], { name: 'Admin' })
   * // (:User:Admin{ name: $name })
   * // $name => 'Admin'
   * @example
   * .node(undefined, undefined, { name: 'Admin' })
   * // ({ name: $name })
   * // $name => 'Admin'
   */
  node<
    Label extends keyof CypherBuilderNodes & string,
    Properties extends CypherBuilderNodes[Label],
  >(
    alias?: string,
    labels?: Label | Label[],
    properties?: Partial<Properties>,
  ): this {
    const _labels = Array.isArray(labels)
      ? labels
      : typeof labels === 'string'
      ? [labels]
      : undefined;
    let _properties: undefined | Record<string, string>;
    if (properties) {
      _properties = Object.entries(properties).reduce(
        (newProperties, [label, value]) => ({
          ...newProperties,
          [label]: this.parametersBag.add(
            value,
            true,
            alias ? `${alias}_${label}` : label,
          ),
        }),
        {} as Record<string, string>,
      );
    }
    this.patterns.push(new Node(alias, _labels, _properties));
    return this;
  }

  relationship<
    T extends keyof CypherBuilderRelationships & string,
    P extends CypherBuilderRelationships[T],
  >(
    direction?: RelationshipDirection,
    types?: T | T[],
    alias?: string,
    limits?: RelationshipLimits,
    properties?: Partial<P>,
  ): this {
    const _types = Array.isArray(types)
      ? types
      : typeof types === 'string'
      ? [types]
      : undefined;
    let _properties: undefined | Record<string, string>;
    if (properties) {
      _properties = Object.entries(properties).reduce(
        (newProperties, [label, value]) => ({
          ...newProperties,
          [label]: this.parametersBag.add(value, true),
        }),
        {} as Record<string, string>,
      );
    }
    this.patterns.push(
      new Relationship(direction, alias, _types, _properties, limits),
    );
    return this;
  }
}

export class PatternStringBuilder
  extends PatternBuilder
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.patterns.length > 0;
  }
  build() {
    return this.patterns.map((p) => p.build()).join('');
  }
}
