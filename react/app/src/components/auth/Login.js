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

import axios from "../../api/axios"
import useAuth from "../../hooks/useAuth"
import ErrMsg from "../ErrMsg"

const Login = () => {
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

			const username = response?.data?.username
			const accessToken = response?.data?.access_token
			const role = response?.data?.role

			setAuth({ username, user, pass, accessToken, role })

			setUser("")
			setPass("")
			navigate(from, { replace: true })

		} catch (err) {
			if (!err?.response) {
				setErrMsg("No response from server")
			} else if (err.response?.status === 401 || err.response?.status === 422) {
				setErrMsg("Incorrect Email or Password")
			} else if (err.response?.status === 403) {
				setErrMsg("Your email is not verified, please verify your email address, link was sent on your email")
			} else {
				setErrMsg("Login Failed")
			}
			handleShowErr(true)
		}
	}

	return (
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
	)
}

export default Login