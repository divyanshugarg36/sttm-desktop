import React, { createContext, useContext, useReducer } from 'react';
import type { MiscPaneAction, MiscPaneState } from './reducer';

type DataLayerValue = [MiscPaneState, React.Dispatch<MiscPaneAction>];

export const DataLayerContext = createContext<DataLayerValue | undefined>(undefined);

type DataLayerProps = {
  reducer: React.Reducer<MiscPaneState, MiscPaneAction>;
  initialState: MiscPaneState;
  children: React.ReactElement;
};

export const DataLayer = ({ reducer, initialState, children }: DataLayerProps) => (
  <DataLayerContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </DataLayerContext.Provider>
);

export const useDataLayerValue = () => useContext(DataLayerContext);
