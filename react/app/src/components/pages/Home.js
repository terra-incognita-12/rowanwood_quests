import { useState, useEffect } from "react"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"

import QuestsList from "../pageComponents/QuestsList"
import WelcomeModal from "../modals/WelcomeModal"
import useAuth from "../../hooks/useAuth"

const Home = () => {
	const [show, setShow] = useState(false);
	const { auth } = useAuth()

  	const handleClose = () => setShow(false);
  	const handleShow = () => setShow(true);

  	useEffect(() => {
  		!auth?.user && handleShow()
  	}, [])

	return (
		<>	
			<WelcomeModal show={show} handleClose={handleClose}/>
			<div className="text-center mt-5">
				<h1>SALVE FATIGO VIATOR</h1>
			</div>
			<QuestsList />
		</>
	)
}

export default Home