export class Literal {
  #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }
}

/**
 * Force the value to be added as literal
 * @param value value to be used as literal
 * @example
 * .unwind([{ id: '123' }], 'data')
 * .merge(m => m.node('user', 'User', { id: literal('data.id') }))
 * // UNWIND $data AS data
 * // MERGE (user:User{ id: data.id })
 */
export function literal(value: string): Literal {
  return new Literal(value);
}
