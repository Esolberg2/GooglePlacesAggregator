import { TailSpin } from  'react-loader-spinner'
import Modal from 'react-modal';
Modal.setAppElement('body')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  overlay: {
    zIndex: 9999,
  }
};

function SpinnerOverlay(props) {
  const {
    message,
    visible
  } = props

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Modal
        isOpen={visible}
        style={customStyles}
      >
        <div> Loading </div>
        <TailSpin
          height="80"
          width="80"
          color="#4fa94d"
          radius="1"
          wrapperStyle={{padding: '20px'}}
          wrapperClass=""
          visible={true}
          />
        <button
          onClick={() => {
            window.loadingAbort()
          }}
        >
          cancel
        </button>
      </Modal>
    </div>
  );
}

export default SpinnerOverlay
