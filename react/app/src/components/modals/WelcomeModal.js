import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"

const WelcomeModal = ({ show, handleClose }) => {
	return (
		<Modal size="lg" centered show={show} onHide={handleClose}>
	        <Modal.Header closeButton>
	        	<Modal.Title>LEGAT ADMINUS RECIPIT VOS</Modal.Title>
	        </Modal.Header>
	        <Modal.Body>
	        	<i><b>Welcome to you o Brave Gladiator!</b></i>
	        	<br/><br/>
	        	<p><i>
	        		It's big honour for me to greeting you, brave one on my virtual arena!<br/>
	        		We would like you to sign yourself with us!
	        	</i></p>
	        	<i>Legat Adminus</i>
	        	<br/>
	        	<b>ANNO MMXXII</b>
	        </Modal.Body>
        	<Modal.Footer>
          		<Button variant="primary" onClick={handleClose} href="/register">
            		Sign up
          		</Button>
        	</Modal.Footer>
      </Modal>
	)
}

export default WelcomeModal