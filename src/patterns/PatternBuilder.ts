import { StringBuilder } from '../BaseBuilder';
import { Node } from './Node';
import { ParametersBag } from '../ParametersBag';
import {
  CypherBuilderLabelsAndTypes,
  CypherBuilderProperties,
} from '../CypherBuilderTypes';
import {
  Relationship,
  RelationshipDirection,
  RelationshipLimits,
} from './Relationship';

export class Pattern {
  protected prefix: string;
  protected parametersBag: ParametersBag;
  protected patterns: StringBuilder[] = [];
  constructor(parametersBag?: ParametersBag, prefix?: string) {
    this.parametersBag = parametersBag ?? new ParametersBag();
    this.prefix = prefix ?? '';
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
          [label]: this.parametersBag.add(value),
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
          [label]: this.parametersBag.add(value),
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

export class PatternBuilder extends Pattern implements StringBuilder {
  build() {
    return this.prefix + this.patterns.map((p) => p.build()).join('');
  }
}
