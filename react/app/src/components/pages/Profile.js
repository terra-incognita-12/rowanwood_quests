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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useAxiosPrivateMultipart from "../../hooks/useAxiosPrivateMultipart"
import useAuth from "../../hooks/useAuth"
import useRedirectLogin from "../../hooks/useRedirectLogin"

import ChangeUsernameDialog from "../pageComponents/ChangeUsernameDialog"
import ChangeEmailDialog from "../pageComponents/ChangeEmailDialog"
import ChangePasswordDialog from "../pageComponents/ChangePasswordDialog"

const Profile = () => {
	const { auth } = useAuth()
	const axiosPrivate = useAxiosPrivate()  
	const axiosPrivateMultipart = useAxiosPrivateMultipart()
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

    const [photo, setPhoto] = useState("")
    const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

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

    const handleUploadPhoto = (e) => {
    	if (!e.target.files[0]) {
            setPhoto("")
        } else {
            setPhoto(e.target.files[0])
        }

     	setPhoto(e.target.files[0])
    }

    const handleDeletePhoto = async () => {
        const answer = window.confirm("Are you sure to delete this photo?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/user/delete_photo`)
            window.location.reload(false);
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
    	const uploadPhoto = async () => {

	    	let photo_data = new FormData();
	        photo_data.append("photo", photo)

    		try {
	            const response = await axiosPrivateMultipart.patch(`/user/update_photo`, photo_data)
	            setPhoto("")
	            window.location.reload(false);
	        } catch (err) {
	            console.log(err)
	            setErrMsg("Error with setting photo")
	        }
    	} 

    	if (photo) {
			uploadPhoto()
    	}
    }, [photo])

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
							Email:
							<Paper elevation={3} sx={{ ml: 2, pl: 1 }}>
								{auth.user}
								<IconButton onClick={handleChangeEmailDialogOpen}>
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
						<Button variant="contained" color="primary" onClick={handleChangePasswordDialogOpen}>Change Password</Button>
					</Col>
					<Col xs={12} md={6}>
						{showErrMsg 
							?
							<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
						    : null
						}
						<Typography gutterBottom variant="h6" display="flex" justifyContent="center" alignItems="center">Photo</Typography>
						{auth.photo
                            ? (
                            	<Box display="flex" justifyContent="center" alignItems="center">
	                                <Box
	                                    component="img"
	                                    sx={{
	                                        height: 200,
	                                        width: 200,
	                                        borderRadius: '8px',
	                                    }}
	                                    alt="Photo"
	                                    src={auth.photo}
	                                />
	                            </Box>
                            )
                            : null
                        }
                        <Box className="mt-2" display="flex" justifyContent="center" alignItems="center">
                        	{auth.photo
                        		? (
                        			<Stack spacing={1} direction="row">
                        				<Button variant="contained" component="label">
		                                	Change Photo
		                                	<input hidden accept="image/*" type="file" onChange={handleUploadPhoto} />
		                            	</Button>
                        				<Button variant="contained" color="error" onClick={handleDeletePhoto}>Delete Photo</Button>
                        			</Stack>
                        		)
                        		:
                        		<Button variant="contained" color="success" component="label">
                                	Upload Photo
                                	<input hidden accept="image/*" type="file" onChange={handleUploadPhoto} />
                            	</Button>
                        	}
                        </Box>
					</Col>
                </Row>
            </CardContent>	
		</Card>
	)
}

export default Profile