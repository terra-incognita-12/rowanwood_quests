import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import Form from "react-bootstrap/Form"

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useRedirectLogin from '../../hooks/useRedirectLogin'

const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

const ChangeUsernameDialog = ({ open, close, user }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const [oldPass, setOldPass] = useState("")

	const [newPass, setNewPass] = useState("")
	const [validNewPass, setValidNewPass] = useState(false)

	const [confNewPass, setConfNewPass] = useState("")
	const [validConfNewPass, setValidConfNewPass] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		const result = PASS_REGEX.test(newPass)
		setValidNewPass(result)
	}, [newPass])

	useEffect(() => {
		setValidConfNewPass(newPass === confNewPass && validNewPass) 
	}, [confNewPass])

	const closeDialog = () => {
		setOldPass("")
		setNewPass("")
		setConfNewPass("")
		close()
	}

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		const valid = PASS_REGEX.test(newPass)
		if (!valid || newPass !== confNewPass) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.post('/auth/change_password_notoken', JSON.stringify({ "old_password": oldPass, "new_password": newPass, "new_password_confirm": confNewPass, "email": user }))
			alert("Your password changed! Use new password to login next time!")
			closeDialog()
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 401) {
                setErrMsg("Wrong password")
			} else if (err.response?.status === 404) {
				setErrMsg("User doesn't exist")
			} else if (err.response?.status === 403) {
				setErrMsg("Passwords do not match")
			} else {
                setErrMsg("Change Password Failed")
            }

            handleShowErr(true)
		}
	}

	return (
		<Dialog open={open} onClose={close} maxWidth='sm' fullWidth={true}>
			{showErrMsg 
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
			    : null
			}
	        <DialogTitle>Change Password</DialogTitle>
	        <Form onSubmit={handleSubmit}>
		        <DialogContent>
			        <DialogContentText>
			        	Confirm your password and provide new one
	          		</DialogContentText>
	          		<FormControl fullWidth>
			          	<TextField
				            margin="dense"
				            id="oldPass"
				            label="Old Password"
				            type="password"
				            fullWidth
				            variant="standard"
				            value={oldPass}
							onChange={(e) => setOldPass(e.target.value)}
							required
			          	/>
			        </FormControl>
		          	<FormControl fullWidth>
			          	<TextField
				            error={!validNewPass && newPass}
				            margin="dense"
				            id="newPass"
				            label="New Password"
				            type="password"
				            fullWidth
				            variant="standard"
				            value={newPass}
							onChange={(e) => setNewPass(e.target.value)}
							required
			          	/>
			          	{!validNewPass && newPass
                        	?
                        	<FormHelperText sx={{ color: "#fc0303" }}>
                        		Password must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
                        	</FormHelperText>
                        	: null
                        }
			        </FormControl>
			        <FormControl fullWidth>
			          	<TextField
				            error={!validConfNewPass && confNewPass}
				            margin="dense"
				            id="confNewPass"
				            label="Confirm New Password"
				            type="password"
				            fullWidth
				            variant="standard"
				            value={confNewPass}
							onChange={(e) => setConfNewPass(e.target.value)}
							required
			          	/>
			          	{!validConfNewPass && confNewPass
                        	?
                        	<FormHelperText sx={{ color: "#fc0303" }}>Passwords should be matching</FormHelperText>
                        	: null
                        }
			        </FormControl>
		        </DialogContent>
		        <DialogActions>
		        	<Button onClick={closeDialog}>Cancel</Button>
		        	<Button type="submit" color="success">Change</Button>
		        </DialogActions>
		    </Form>
      </Dialog>
	)
}

export default ChangeUsernameDialog