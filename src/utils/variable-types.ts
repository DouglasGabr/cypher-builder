/* eslint-disable @typescript-eslint/ban-types */
import { CypherBuilderNodes } from '../types/labels-and-properties';

declare module '../types/labels-and-properties' {
  export interface CypherBuilderNodes {
    Person: {
      id: string;
      name: string;
      age: number;
    };
  }
}

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
  { b: PrimitiveVarType<number>; c: NodeVarType<'Person'> },
  A
>;

type AnyNodeVarType = NodeVarType<keyof CypherBuilderNodes>;
type RootVariablesSetOptions<
  Variables extends Record<string, VarType<unknown, unknown>>,
> = {
  [Key in keyof Variables & string]: Variables[Key]['__value'];
};

type NodeVariablesSetOptions<
  Variables extends Record<string, VarType<unknown, unknown>>,
> = {
  [Key in keyof Variables & string]: Variables[Key] extends AnyNodeVarType
    ? RootVariablesSetOptions<{
        [Sub in keyof Variables[Key]['__value'] &
          string as `${Key}.${Sub}`]: PrimitiveVarType<
          Variables[Key]['__value'][Sub]
        >;
      }>
    : never;
}[keyof Variables & string];

type SetOptions<Variables extends Record<string, VarType<unknown, unknown>>> =
  RootVariablesSetOptions<Variables> & NodeVariablesSetOptions<Variables>;

class Test<Variables extends Record<string, VarType<unknown, unknown>>> {
  set<Key extends keyof SetOptions<Variables>>(
    key: Key,
    value: SetOptions<Variables>[Key],
  ) {
    console.log('set', key, value);
  }
}

const t = new Test<B>();

t.set('c.age', 42);
