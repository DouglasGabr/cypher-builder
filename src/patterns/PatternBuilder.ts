import { StringBuilder } from '../BaseBuilder';
import { Node } from './Node';
import { ParametersBag } from '../parameters/ParametersBag';
import {
  CypherBuilderLabelsAndTypes,
  CypherBuilderProperties,
} from '../CypherBuilderTypes';
import {
  Relationship,
  RelationshipDirection,
  RelationshipLimits,
} from './Relationship';

export class PatternBuilder {
  protected parametersBag: ParametersBag;
  protected patterns: StringBuilder[] = [];
  constructor(parametersBag?: ParametersBag) {
    this.parametersBag = parametersBag ?? new ParametersBag();
  }

  node<
    T extends CypherBuilderLabelsAndTypes['nodes'],
    P extends CypherBuilderProperties[T],
  >(alias?: string, labels?: T | T[], properties?: Partial<P>): this {
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
          [label]: this.parametersBag.add(value, true),
        }),
        {} as Record<string, string>,
      );
    }
    this.patterns.push(new Node(alias, _labels, _properties));
    return this;
  }

  relationship<
    T extends CypherBuilderLabelsAndTypes['relationships'],
    P extends CypherBuilderProperties[T],
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
  implements StringBuilder
{
  build() {
    return this.patterns.map((p) => p.build()).join('');
  }
}
