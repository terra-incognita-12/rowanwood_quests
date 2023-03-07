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
import LoadingBackdrop from "../Backdrop"

const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/

const ChangeEmailDialog = ({ open, close, username }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const redirectLogin = useRedirectLogin(location)

	const [backdropOpen, setBackdropOpen] = useState(false)

	const [email, setEmail] = useState("")
	const [validEmail, setValidEmail] = useState(false)

	const [pass, setPass] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		const result = EMAIL_REGEX.test(email)
		setValidEmail(result)
	}, [email])

	const closeDialog = () => {
		setEmail("")
		setPass("")
		close()
	}

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		setBackdropOpen(true)

		const valid = EMAIL_REGEX.test(email)
		if (!valid) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		try {
			const response = await axiosPrivate.patch('/user/change_email', JSON.stringify({ "email": email, "password": pass }))
			alert("Email with change email link was sent to you!")
			closeDialog()
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Change email failed")
			}
			handleShowErr(true)
		} finally {
			setBackdropOpen(false)
		}
	}

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		<Dialog open={open} onClose={close} maxWidth='sm' fullWidth={true} sx={{ zIndex: '2' }}>
			{showErrMsg
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
					: null
			}
			<DialogTitle>Change Email</DialogTitle>
			<Form onSubmit={handleSubmit}>
				<DialogContent>
					<DialogContentText>
						Provide new email and confirm your password. You will recieve confirmation mail to complete changes
					</DialogContentText>
					<FormControl fullWidth>
						<TextField
							autoFocus
							error={!validEmail && email}
							margin="dense"
							id="email"
							label="Email"
							type="email"
							fullWidth
							variant="standard"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						{!validEmail && email
							?
							<FormHelperText sx={{ color: "#fc0303" }}>Should be proper email format</FormHelperText>
							: null
						}
					</FormControl>
					<FormControl fullWidth>
						<TextField
							autoFocus
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
		</>
	)
}

export default ChangeEmailDialog