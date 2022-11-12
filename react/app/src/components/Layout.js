import { Outlet } from "react-router-dom"
import Container from "react-bootstrap/Container";

import Sitenavbar from "./Sitenavbar"

const Layout = () => {
	return (
		<>
			<Sitenavbar />
			<Container>
				<Outlet />
			</Container>
		</>
	)
}

export default Layout