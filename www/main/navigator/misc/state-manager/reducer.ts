/** The misc pane's local state: which panel it shows. */
export interface MiscPaneState {
  miscPanel: string;
}

export type MiscPaneAction = { type: 'SET_PANEL'; miscPanel: string };

export const initialState: MiscPaneState = {
  miscPanel: 'History',
};
export const actionTypes = {
  SET_PANEL: 'SET_PANEL',
} as const;
const reducer = (state: MiscPaneState, action: MiscPaneAction) => {
  switch (action.type) {
    case actionTypes.SET_PANEL:
      return {
        ...state,
        miscPanel: action.miscPanel,
      };
    default:
      return state;
  }
};

export default reducer;
