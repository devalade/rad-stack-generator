import { Config, Generator, Schema } from './meta-models';
import { buildNameVariations } from './name-variations';

const generate = (schema: Schema, { scope }: Config) => {
  const { ref, refs, model, models } = buildNameVariations(schema);
  const constantCase = refs.toUpperCase();

  const template = `
import { ${model} } from '@${scope}/api-interfaces';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import * as ${models}Actions from './${refs}.actions';

export const ${constantCase}_FEATURE_KEY = '${refs}';

export interface ${models}State extends EntityState<${model}> {
  selectedId?: string | number; // which ${models} record has been selected
  loaded: boolean; // has the ${models} list been loaded
  error?: string | null; // last known error (if any)
}

export interface ${models}PartialState {
  readonly [${constantCase}_FEATURE_KEY]: ${models}State;
}

export const ${refs}Adapter: EntityAdapter<${model}> = createEntityAdapter<${model}>();

export const initial${models}State: ${models}State = ${refs}Adapter.getInitialState({
  // set initial required properties
  loaded: false
});

const onFailure = (state, { error }) => ({ ...state, error});

const _${refs}Reducer = createReducer(
  initial${models}State,
  on(${models}Actions.select${model}, (state, { selectedId }) =>
    Object.assign({}, state, { selectedId })
  ),
  on(${models}Actions.resetSelected${model}, state =>
    Object.assign({}, state, { selectedId: null })
  ),
  on(${models}Actions.reset${models}, state => ${refs}Adapter.removeAll(state)),
  // Load ${refs}
  on(${models}Actions.load${models}, state => ({ ...state, loaded: false, error: null })),
  on(${models}Actions.load${models}Success, (state, { ${refs} }) =>
    ${refs}Adapter.setAll(${refs}, { ...state, loaded: true })
  ),
  on(${models}Actions.load${models}Failure, onFailure),
  // Load ${ref}
  on(${models}Actions.load${model}, state =>
    ({ ...state, loaded: false, error: null })
  ),
  on(${models}Actions.load${model}Success, (state, { ${ref} }) =>
    ${refs}Adapter.upsertOne(${ref}, { ...state, loaded: true })
  ),
  on(${models}Actions.load${model}Failure, onFailure),
  // Add ${ref}
  on(${models}Actions.create${model}Success, (state, { ${ref} }) =>
    ${refs}Adapter.addOne(${ref}, state)
  ),
  on(${models}Actions.create${model}Failure, onFailure),
  // Update ${ref}
  on(${models}Actions.update${model}Success, (state, { ${ref} }) =>
    ${refs}Adapter.updateOne({ id: ${ref}.id, changes: ${ref} }, state)
  ),
  on(${models}Actions.update${model}Failure, onFailure),
  // Delete ${ref}
  on(${models}Actions.delete${model}Success, (state, { ${ref} }) =>
    ${refs}Adapter.removeOne(${ref}.id, state)
  ),
  on(${models}Actions.delete${model}Failure, onFailure),
);

export function ${refs}Reducer(state: ${models}State | undefined, action: Action) {
  return _${refs}Reducer(state, action);
}
  `;

  return {
    template,
    title: `${models} Reducer`,
    fileName: `libs/core-state/src/lib/${refs}/${refs}.reducer.ts`,
  };
};

export const ReducerGenerator: Generator = {
  generate,
};
