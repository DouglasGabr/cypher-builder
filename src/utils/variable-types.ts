/* eslint-disable @typescript-eslint/ban-types */
import { CypherBuilderNodes } from '../types/labels-and-properties';
import { Literal } from './literal';

type VarType<Type, Value> = {
  __type: Type;
  __value: Value;
};

export type NodeVarType<Label extends keyof CypherBuilderNodes> = VarType<
  'node',
  CypherBuilderNodes[Label]
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNodeVarType = NodeVarType<any>;

export type PrimitiveVarType<Primitive> = VarType<'primitive', Primitive>;

export type Variables = {
  [k: string]: VarType<unknown, unknown>;
};

export type VariableTypes<
  New extends Variables,
  Prev extends Variables = {},
> = Omit<Prev, keyof New> & New;

type RootVariablesSetOptions<TVariables extends Variables> = {
  [Key in keyof TVariables & string]: TVariables[Key]['__value'] | Literal;
};

type _NodeVariablesSetOptions<TVariables extends Variables> = {
  [Key in keyof TVariables & string]: TVariables[Key] extends AnyNodeVarType
    ? RootVariablesSetOptions<{
        [Sub in keyof TVariables[Key]['__value'] &
          string as `${Key}.${Sub}`]: PrimitiveVarType<
          TVariables[Key]['__value'][Sub]
        >;
      }>
    : never;
}[keyof TVariables & string];
type NodeVariablesSetOptions<TVariables extends Variables> =
  _NodeVariablesSetOptions<TVariables> extends never
    ? {}
    : _NodeVariablesSetOptions<TVariables>;

export type SetOptions<TVariables extends Variables> =
  RootVariablesSetOptions<TVariables> & NodeVariablesSetOptions<TVariables>;
