import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import { NavLink } from "react-router-dom";

const Sitenavbar = () => {
	return (
		<Navbar bg="dark" variant="dark">
			<Container>
				<Navbar.Brand href="/">Rowan Wood</Navbar.Brand>
				<Nav className="me-auto">
					<NavLink to="/" className="nav-link">Home</NavLink>
					<NavLink to="/login" className="nav-link">Login</NavLink>
				</Nav>
			</Container>
		</Navbar>
	)
}

export default Sitenavbar