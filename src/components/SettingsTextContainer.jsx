import React, { useRef } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import PropTypes from 'prop-types';
import InfoPopup from './InfoPopup';
import { styles } from '../style';

function SettingsTextContainer({
  style, title, description, popupTitle, children,
}) {
  const infoRef = useRef();

  return (
    <div style={{ ...style, ...styles.SettingsTextContainer }}>
      <div
        style={{
          fontWeight: 'bold', color: '#36B569', display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}
      >
        {title}
        <IoInformationCircleOutline
          style={{
            paddingLeft: '2.5px',
          }}
          onClick={() => {
            infoRef.current.toggleVisible();
          }}
        />
      </div>
      <InfoPopup
        ref={infoRef}
        message={description}
        title={popupTitle}
      />
      <div
        style={{
          flexGrow: '1',
        }}
      />
      <div
        style={{
          display: 'flex', justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

SettingsTextContainer.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  popupTitle: PropTypes.string.isRequired,
};

SettingsTextContainer.defaultProps = {
  style: {},
};

export default SettingsTextContainer;
