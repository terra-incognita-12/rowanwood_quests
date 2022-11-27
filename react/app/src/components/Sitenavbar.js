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
					<NavLink to="/" className="nav-link">Home</NavLink>
					<NavLink to="/library" className="nav-link">Library</NavLink>
					<NavLink to="/about" className="nav-link">About</NavLink> 
					{ auth?.user 
						?
						<>
							<NavLink to="/profile" className="nav-link">Profile</NavLink>
							{ auth?.role === 'admin' 
								? 
								<>
									<NavLink to="/editor" className="nav-link">Editor</NavLink>
									<NavLink to="/admin" className="nav-link">Admin</NavLink>
								</>	
								: auth?.role === 'editor'
									? <NavLink to="/editor" className="nav-link">Editor</NavLink>
									: null 
							}
						</>
						: null
					}	
				</Nav>
				{ auth?.user
					?
					<Nav>
						<NavLink to="/logout" className="nav-link">Log Out</NavLink>
					</Nav>
					: 
					<Nav>
						<NavLink to="/login" className="nav-link">Sign in</NavLink>
					</Nav>
				}
			</Container>
		</Navbar>
	)
}

export default Sitenavbar