import {RENDER_STATE} from 'react-map-gl-draw';

export function getEditHandleStyle({feature, state}) {
  switch (state) {
    case RENDER_STATE.SELECTED:
    case RENDER_STATE.HOVERED:
    case RENDER_STATE.UNCOMMITTED:
      return {
        fill: 'rgb(251, 176, 59)',
        fillOpacity: 1,
        stroke: 'rgb(255, 255, 255)',
        strokeWidth: 2,
        r: 7
      };

    default:
      return {
        fill: 'rgb(251, 176, 59)',
        fillOpacity: 1,
        stroke: 'rgb(255, 255, 255)',
        strokeWidth: 2,
        r: 5
      };
  }
}

export function getFeatureStyle({feature, index, state}) {
  switch (state) {
    case RENDER_STATE.SELECTED:
    case RENDER_STATE.HOVERED:
    case RENDER_STATE.UNCOMMITTED:
    case RENDER_STATE.CLOSING:
      return {
        stroke: 'rgb(251, 176, 59)',
        strokeWidth: 2,
        fill: 'rgb(251, 176, 59)',
        fillOpacity: 0.3,
        strokeDasharray: '4,2'
      };

    default:
      return {
        stroke: 'rgb(60, 178, 208)',
        strokeWidth: 2,
        fill: 'rgb(60, 178, 208)',
        fillOpacity: 0.1
      };
  }
}

// const SettingsButton = {
//   paddingTop: '10px',
//   fontSize: '12px',
//   display: 'flex',
//   textAlign: 'center',
//   justifyContent: 'center'
// }

const SettingsButton = {
  width: '150px',
  padding: '5px',
  margin: '5px',
}

const ButtonDisabled = {
  backgroundColor:'#cccccc'
}

const SettingsDescription = {
  paddingTop: '10px',
  fontSize: '12px',
  display: 'flex',
  textAlign: 'center',
  justifyContent: 'center'
}

const SettingsTextContainer = {
  paddingLeft: '5px',
  paddingRight: '5px',
  paddingTop: '5px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  flex: '1', 
  justifyContent: 'space-between',
}

export const styles = {
  SettingsButton: SettingsButton,
  ButtonDisabled: ButtonDisabled,
  SettingsDescription: SettingsDescription,
  SettingsTextContainer: SettingsTextContainer,
}
