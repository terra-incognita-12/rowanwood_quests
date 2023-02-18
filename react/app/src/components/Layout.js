import { Outlet } from "react-router-dom"

import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import BottomNavigation from '@mui/material/BottomNavigation';
import Box from '@mui/material/Box';

import Sitenavbar from "./Sitenavbar"

const Layout = () => {
	return (
		<Container
			maxWidth={false}
			disableGutters
			sx={{ position: "relative", minHeight: "100vh", pb: 4 }}
		>
			<Sitenavbar />
			<Container maxWidth="xl">
				<Outlet />
			</Container>
			<footer>
			  <Paper sx={{ backgroundColor: "black" }}>
					<Typography variant="body1" display="flex" justifyContent="center" alignItems="center" color="text.secondary">ANNO MMXXIII</Typography>
				</Paper>
			</footer>
		</Container>
	)
}

export default Layout