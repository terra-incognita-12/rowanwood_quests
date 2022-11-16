import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"

import useAuth from "../hooks/useAuth"

const Sitenavbar = () => {

	const { auth } = useAuth()

	return (
		<Navbar bg="dark" variant="dark">
			<Container>
				<Navbar.Brand>Rowan Wood</Navbar.Brand>
				<Nav className="me-auto">
					{ auth?.user 
						?
						<>
							<NavLink to="/" className="nav-link">Home</NavLink> 
							{ auth?.role === 'admin' 
								? <NavLink to="/admin" className="nav-link">Admin Panel</NavLink>	
								: null
							}
						</>
						: 
						<>
							<NavLink to="/login" className="nav-link">Login</NavLink>
							<NavLink to="/register" className="nav-link">Register</NavLink>
						</>
					}	
				</Nav>
				{ auth?.user
					?
					<Nav>
						<NavLink to="/logout" className="nav-link">Log Out</NavLink>
					</Nav>
					: null
				}
			</Container>
		</Navbar>
	)
}

export default Sitenavbar