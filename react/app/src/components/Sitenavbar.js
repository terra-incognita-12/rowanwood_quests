import { Link } from "react-router-dom"
import { useState } from "react"

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
// import AdbIcon from '@mui/icons-material/Adb';

import useAuth from "../hooks/useAuth"

const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const Sitenavbar = () => {
	const { auth } = useAuth()

	const [anchorElNav, setAnchorElNav] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);

	const handleOpenNavMenu = (event) => {
	setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event) => {
	setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
	setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
	setAnchorElUser(null);
	};

	return (
		<AppBar position="static">
		 	<Container maxWidth="xl">
				<Toolbar disableGutters>
					{/*<AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />*/}
					<Typography
					variant="h6"
					noWrap
					sx={{
						mr: 2,
						display: { xs: 'none', md: 'flex' },
						fontFamily: 'monospace',
						fontWeight: 700,
						letterSpacing: '.3rem',
						color: 'inherit',
						textDecoration: 'none',
					}}
					>
					ROWAN WOOD
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
						 	size="large"
						 	aria-label="account of current user"
						  	aria-controls="menu-appbar"
						  	aria-haspopup="true"
						  	onClick={handleOpenNavMenu}
						  	color="inherit"
						>
							<MenuIcon />
						</IconButton>

						<Menu
							id="menu-appbar"
						  	anchorEl={anchorElNav}
						  	anchorOrigin={{
						    	vertical: 'bottom',
						    	horizontal: 'left',
						  	}}
						  	keepMounted
						  	transformOrigin={{
						    	vertical: 'top',
						    	horizontal: 'left',
						  	}}
						  	open={Boolean(anchorElNav)}
						  	onClose={handleCloseNavMenu}
						  	sx={{
						    	display: { xs: 'block', md: 'none' },
						 	}}
						>
						    <MenuItem component={Link} to="/">
						    	<Typography textAlign="center">Home</Typography>
						    </MenuItem>
						    <MenuItem component={Link} to="/library">
						    	<Typography textAlign="center">Library</Typography>
						    </MenuItem>
						    <MenuItem component={Link} to="/about">
						    	<Typography textAlign="center">About</Typography>
						    </MenuItem>
						    { auth?.role === 'admin' 
								? 
								<>
								  	<MenuItem component={Link} to="/editor">
						    			<Typography textAlign="center">Editor</Typography>
						    		</MenuItem>
						    		<MenuItem component={Link} to="/admin">
						    			<Typography textAlign="center">Admin</Typography>
						    		</MenuItem>
								</>	
								: auth?.role === 'editor'
									? 
									<MenuItem component={Link} to="/editor">
						    			<Typography textAlign="center">Editor</Typography>
						    		</MenuItem>
									: null 
							}
						</Menu>
					</Box>

					{/*<AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />*/}
					
					<Typography
						variant="h5"
						noWrap
						component="a"
						href=""
						sx={{
							mr: 2,
						  	display: { xs: 'flex', md: 'none' },
						  	flexGrow: 1,
						  	fontFamily: 'monospace',
						  	fontWeight: 700,
						  	letterSpacing: '.3rem',
						  	color: 'inherit',
						  	textDecoration: 'none',
						}}
					>
					ROWAN WOOD
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						<Button
						    component={Link}
						    to="/"
						    sx={{ my: 2, color: 'white', display: 'block' }}
					  	>
					    Home
					  	</Button>
					  	<Button
						    component={Link}
						    to="/library"
						    sx={{ my: 2, color: 'white', display: 'block' }}
					  	>
					    Library
					  	</Button>
					  	<Button
						    component={Link}
						    to="/about"
						    sx={{ my: 2, color: 'white', display: 'block' }}
					  	>
					    About
					  	</Button>
					  	{ auth?.role === 'admin' 
							? 
							<>
							  	<Button
								    component={Link}
								    to="/editor"
								    sx={{ my: 2, color: 'white', display: 'block' }}
							  	>
							    Editor
							  	</Button>
							  	<Button
								    component={Link}
								    to="/admin"
								    sx={{ my: 2, color: 'white', display: 'block' }}
							  	>
							    Admin
							  	</Button>
								
							</>	
							: auth?.role === 'editor'
								? 
								<Button
								    component={Link}
								    to="/editor"
								    sx={{ my: 2, color: 'white', display: 'block' }}
							  	>
							    Editor
							  	</Button>
								: null 
						}
					</Box>

					<Box sx={{ flexGrow: 0 }}>
					{ auth?.user 
						?
						<>
							<Tooltip title="Open settings">
						  		<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
						    		<Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
						  		</IconButton>
							</Tooltip>
							<Menu
								sx={{ mt: '45px' }}
							  	id="menu-appbar"
								anchorEl={anchorElUser}
								anchorOrigin={{
									vertical: 'top',
								    horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
								  	vertical: 'top',
								  	horizontal: 'right',
								}}
								open={Boolean(anchorElUser)}
								onClose={handleCloseUserMenu}
							>
							  	<MenuItem component={Link} to="/profile">
								    <Typography textAlign="center">Profile</Typography>
								</MenuItem>
								<MenuItem component={Link} to="/logout">
								    <Typography textAlign="center">Logout</Typography>
								</MenuItem>
							</Menu>
						</>
						:
						<Button
						    component={Link}
						    to="/login"
						    sx={{ my: 2, color: 'white', display: 'block' }}
					  	>
					    Login
					  	</Button>
					}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default Sitenavbar;