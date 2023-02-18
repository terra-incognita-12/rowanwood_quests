import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormHelperText from '@mui/material/FormHelperText';

import axios from "../../../api/axios"
import ErrMsg from "../../ErrMsg"
import LoadingBackdrop from "../../Backdrop"

const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

const ChangePass = () => {
	const [backdropOpen, setBackdropOpen] = useState(false)

	const navigate = useNavigate()

	const [pass, setPass] = useState("")
	const [validPass, setValidPass] = useState(false)

	const [confPass, setConfPass] = useState("")
	const [validConfPass, setValidConfPass] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const { token } = useParams()

	const checkValidToken = async (e) => {
		try {
			const response = await axios.post("/auth/check_valid_change_password_token", JSON.stringify({ "password_token": token }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)
		} catch (err) {
			navigate("/login", { replace: true})
		}
	}

	useEffect(() => {
		checkValidToken()
	}, [])

	useEffect(() => {
		const result = PASS_REGEX.test(pass)
		setValidPass(result)
	}, [pass])

	useEffect(() => {
		setValidConfPass(pass === confPass && validPass)
	}, [confPass])

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		setBackdropOpen(true)

		e.preventDefault()

		const validPass = PASS_REGEX.test(pass)

		if (!validPass || pass !== confPass) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		try {
			const response = await axios.post("/auth/confirm_change_password", JSON.stringify({  "password_token": token, "new_password": pass, "new_password_confirm": confPass}),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			navigate("/login", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Change Password Failed")
			}
			setBackdropOpen(false)
			handleShowErr(true)
		}
	}

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		<Row className="justify-content-center mt-5">
			<Col xs={12} lg={5}>
				{showErrMsg
					?
					<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
					: null
				}
				<Card>
					<CardContent>
						<Form onSubmit={handleSubmit} className="mb-2">
							<FormControl fullWidth className="mb-3">
								<InputLabel htmlFor="password">New Password</InputLabel>
								<OutlinedInput
									error={!validPass && pass}
									id="password"
									type="password"
									value={pass}
									onChange={(e) => setPass(e.target.value)}
									label="New Password"
									required
								/>
								{!validPass && pass
									?
									<FormHelperText sx={{ color: "#fc0303" }}>
										Password must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
									</FormHelperText>
									: null
								}
							</FormControl>
							<FormControl fullWidth className="mb-3">
								<InputLabel htmlFor="confPass">Confirm New Password</InputLabel>
								<OutlinedInput
									error={!validConfPass && confPass}
									id="confPass"
									type="password"
									value={confPass}
									onChange={(e) => setConfPass(e.target.value)}
									label="Confirm New Password"
									required
								/>
								{!validConfPass && confPass
									?
									<FormHelperText sx={{ color: "#fc0303" }}>Passwords should be matching</FormHelperText>
									: null
								}
							</FormControl>
							<Button variant="contained" color="success" type="submit" fullWidth>Change Password</Button>
						</Form>
					</CardContent>
				</Card>
			</Col>
		</Row>
		</>
	)
}

export default ChangePass