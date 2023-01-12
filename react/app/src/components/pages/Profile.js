import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import moment from 'moment'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useAuth from "../../hooks/useAuth"
import useRedirectLogin from "../../hooks/useRedirectLogin"

import ChangeUsernameDialog from "../pageComponents/ChangeUsernameDialog"
import ChangeEmailDialog from "../pageComponents/ChangeEmailDialog"
import ChangePasswordDialog from "../pageComponents/ChangePasswordDialog"

const Profile = () => {
	const { auth } = useAuth()
	const axiosPrivate = useAxiosPrivate()  
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

    const [changeUsernameDialogOpen, setChangeUsernameDialogOpen] = useState(false)
    const handleChangeUsernameDialogOpen = () => {
    	setChangeUsernameDialogOpen(true)
  	}
  	const handleChangeUsernameDialogClose = () => {
  		setChangeUsernameDialogOpen(false)
  	}

  	const [changeEmailDialogOpen, setChangeEmailDialogOpen] = useState(false)
    const handleChangeEmailDialogOpen = () => {
    	setChangeEmailDialogOpen(true)
  	}
  	const handleChangeEmailDialogClose = () => {
  		setChangeEmailDialogOpen(false)
  	}

  	const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false)
    const handleChangePasswordDialogOpen = () => {
    	setChangePasswordDialogOpen(true)
  	}
  	const handleChangePasswordDialogClose = () => {
  		setChangePasswordDialogOpen(false)
  	}

	return (
		<Card className="mt-3">

			<ChangeUsernameDialog open={changeUsernameDialogOpen} close={handleChangeUsernameDialogClose} user={auth.user} />
			<ChangeEmailDialog open={changeEmailDialogOpen} close={handleChangeEmailDialogClose} username={auth.username} />
			<ChangePasswordDialog open={changePasswordDialogOpen} close={handleChangePasswordDialogClose} user={auth.user} />

			<CardContent>
                <Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">Profile</Typography>
				<Row>
					<Col xs={12} md={6}>
						<Typography gutterBottom variant="h6" display="flex" alignItems="center" sx={{ ml: 1 }}>
							Username:
							<Paper elevation={3} sx={{ ml: 2, pl: 1 }}>
								{auth.username}
								<IconButton onClick={handleChangeUsernameDialogOpen}>
									<EditIcon/>
								</IconButton>
							</Paper>
						</Typography>
						<hr/>
						<Typography gutterBottom variant="h6" display="flex" alignItems="center" sx={{ ml: 1 }}>
							Role:
							<Paper elevation={3} sx={{ ml: 2, pl: 1, pr: 1 }}>
								{auth.role}
							</Paper>
						</Typography>
						<hr/>
						<Typography gutterBottom variant="h6" display="flex" alignItems="center" sx={{ ml: 1 }}>
							Email:
							<Paper elevation={3} sx={{ ml: 2, pl: 1 }}>
								{auth.user}
								<IconButton onClick={handleChangeEmailDialogOpen}>
									<EditIcon/>
								</IconButton>
							</Paper>
						</Typography>
						<hr/>
						<Button variant="contained" color="primary" onClick={handleChangePasswordDialogOpen}>Change Password</Button>
					</Col>
					<Col xs={12} md={6}>
						<Typography gutterBottom variant="h6" display="flex" justifyContent="center" alignItems="center">Photo</Typography>
					</Col>
                </Row>
            </CardContent>	
		</Card>
	)
}

export default Profile