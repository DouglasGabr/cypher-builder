/* eslint-disable @typescript-eslint/ban-types */
import { CypherBuilderNodes } from '../types/labels-and-properties';

type VarType<Type, Value> = {
  __type: Type;
  __value: Value;
};

type NodeVarType<Label extends keyof CypherBuilderNodes> = VarType<
  'node',
  CypherBuilderNodes[Label]
>;

type PrimitiveVarType<Primitive> = VarType<'primitive', Primitive>;

type VariableTypes<
  New extends Record<string, unknown>,
  Prev extends Record<string, unknown> = {},
> = Omit<Prev, keyof New> & New;

type A = VariableTypes<{ a: PrimitiveVarType<string> }>;
type B = VariableTypes<
  { b: PrimitiveVarType<number>; c: NodeVarType<'User'> },
  A
>;

type SetOptionsKey<Variables, Key extends keyof Variables & string> =
  | Key
  | (Variables[Key] extends NodeVarType<infer Label>
      ? `${Key}.${keyof CypherBuilderNodes[Label] & string}`
      : never);

type NodeVarTypeKey<
  Variables,
  Key extends keyof Variables & string,
> = Variables[Key] extends NodeVarType<infer Label>
  ? `${Key}.${keyof CypherBuilderNodes[Label] & string}`
  : never;

type SetOptions<Variables extends Record<string, VarType<unknown, unknown>>> = {
  [Key in keyof Variables & string]: Variables[Key]['__value'];
} & {
  [Key in keyof Variables & string as NodeVarTypeKey<Variables, Key>]: 1;
};

const setOptions: SetOptions<B> = {};
