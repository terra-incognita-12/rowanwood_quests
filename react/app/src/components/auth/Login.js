import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LoadingBackdrop from "../Backdrop"

import axios from "../../api/axios"
import useAuth from "../../hooks/useAuth"
import ErrMsg from "../ErrMsg"

const Login = () => {
	const [backdropOpen, setBackdropOpen] = useState(false)
	const [user, setUser] = useState("")
	const [pass, setPass] = useState("")
	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const navigate = useNavigate()
	const location = useLocation()
	const from = location.state?.from?.pathname || "/"

	const { setAuth } = useAuth()

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		setBackdropOpen(true)

		e.preventDefault()

		try {
			const response = await axios.post("/auth/login", JSON.stringify({"email": user, "password": pass}),
				{
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					withCredentials: true
				}
			)

			const id = response?.data?.id
			const username = response?.data?.username
			const accessToken = response?.data?.access_token
			const role = response?.data?.role
			const photo = response?.data?.photo

			setAuth({ id, username, user, pass, accessToken, role, photo })

			setUser("")
			setPass("")
			navigate(from, { replace: true })

		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Login Failed")
			}
			handleShowErr(true)
		} finally {
			setBackdropOpen(false)
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
								<InputLabel htmlFor="user">Email</InputLabel>
								<OutlinedInput
									id="user"
									type="email"
									value={user}
									onChange={(e) => setUser(e.target.value)}
									label="Email"
									required
								/>
							</FormControl>
							<FormControl fullWidth className="mb-3">
								<InputLabel htmlFor="password">Password</InputLabel>
								<OutlinedInput
									id="password"
									type="password"
									value={pass}
									onChange={(e) => setPass(e.target.value)}
									label="Password"
									required
								/>
							</FormControl>
							<Button variant="contained" color="success" type="submit" fullWidth>Login</Button>
						</Form>
						<Typography variant="body1" display="flex" justifyContent="center" alignItems="center">Don't have an account yet?<Button component={Link} to="/register">Sign up!</Button></Typography>
						<Typography variant="body1" display="flex" justifyContent="center" alignItems="center">Forgot Password?<Button component={Link} to="/forgetpass">Let's recover it!</Button></Typography>
					</CardContent>
				</Card>
			</Col>
		</Row>
		</>
	)
}

export default Login