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

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/

const ChangeUsernameDialog = ({ open, close, user }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const [username, setUsername] = useState("")
	const [validUsername, setValidUsername] = useState(false)

	const [pass, setPass] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		const result = USERNAME_REGEX.test(username)
		setValidUsername(result)
	}, [username])

	const closeDialog = () => {
		setUsername("")
		setPass("")
		close()
	}

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		const valid = USERNAME_REGEX.test(username)
		if (!valid) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.post('/auth/change_username', JSON.stringify({ "username": username, "password": pass, "email": user }))
			window.location.reload(false);
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 401) {
                setErrMsg("Wrong password")
            } else if (err.response?.status === 403) {
				setErrMsg("User with this username already exists")
			} else if (err.response?.status === 404) {
				setErrMsg("User doesn't exist")
			} else {
                setErrMsg("Change username Failed")
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
	        <DialogTitle>Change Username</DialogTitle>
	        <Form onSubmit={handleSubmit}>
		        <DialogContent>
			        <DialogContentText>
			        	Provide new username and confirm your password
	          		</DialogContentText>
		          	<FormControl fullWidth>
			          	<TextField
				            autoFocus
				            error={!validUsername && username}
				            margin="dense"
				            id="username"
				            label="Username"
				            type="text"
				            fullWidth
				            variant="standard"
				            value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
			          	/>
			          	{!validUsername && username
                        	?
                        	<FormHelperText sx={{ color: "#fc0303" }}>
                        		Username must start with the lower or upper case letter and after must followed by 3 to 23 char that can be lowercase, upper, number, - and _
                        	</FormHelperText>
                        	: null
                        }
			        </FormControl>
			        <FormControl fullWidth>
			          	<TextField
				            margin="dense"
				            id="password"
				            label="Password"
				            type="password"
				            fullWidth
				            variant="standard"
				            value={pass}
							onChange={(e) => setPass(e.target.value)}
							required
			          	/>
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