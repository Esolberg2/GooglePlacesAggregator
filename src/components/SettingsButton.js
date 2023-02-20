import { styles } from '../style'

function SettingsButton(props) {
  return (
    <button
      {...props}
      style={props.selected ? {...styles.SettingsButton, ...styles.ButtonSelected} : styles.SettingsButton}
      >
      {props.children}
      </button>
    )
}

export default SettingsButton
