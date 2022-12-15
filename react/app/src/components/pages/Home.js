import { useState, useEffect } from "react"
import Typography from '@mui/material/Typography';

import QuestsList from "../pageComponents/QuestsList"
// import Modal from "react-bootstrap/Modal"
// import Button from "react-bootstrap/Button"

// import WelcomeModal from "../modals/WelcomeModal"
// import useAuth from "../../hooks/useAuth"

const Home = () => {
	// const [show, setShow] = useState(false);
	// const { auth } = useAuth()

  	// const handleClose = () => setShow(false);
  	// const handleShow = () => setShow(true);

  	// useEffect(() => {
  	// 	!auth?.user && handleShow()
  	// }, [])

	return (
		<div className="mt-3">	
			{/*<WelcomeModal show={show} handleClose={handleClose}/>*/}
			<Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">GRATVS GLADIATOR FORTIS</Typography>
			<Typography gutterBottom variant="h6" display="flex" justifyContent="center" alignItems="center" color="text.secondary">Welcome Brave Gladiator</Typography>
			<QuestsList />
		</div>
	)
}

export default Home