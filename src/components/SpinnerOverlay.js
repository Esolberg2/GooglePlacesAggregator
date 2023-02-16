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
  },
  overlay: {
    zIndex: 9999,
  }
};
export function SpinnerOverlay(props) {
  const {
    message,
    visible
  } = props

  return (
    <Modal
      isOpen={visible}
      style={customStyles}
    >
    <div> {message} </div>
    <TailSpin
      height="80"
      width="80"
      color="#4fa94d"
      radius="1"
      wrapperStyle={{}}
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
  );
}
