import { useState, useEffect } from "react"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"

import WelcomeModal from "../modals/WelcomeModal"

const Home = () => {

	const [show, setShow] = useState(false);

  	const handleClose = () => setShow(false);
  	const handleShow = () => setShow(true);

  	useEffect(() => {
  		handleShow()
  	}, [])

	return (
		<>	
			<div className="text-center mt-5">
				<h1>SALVE FATIGO VIATOR</h1>
			</div>
			<WelcomeModal show={show} handleClose={handleClose}/>
		</>
	)
}

export default Home