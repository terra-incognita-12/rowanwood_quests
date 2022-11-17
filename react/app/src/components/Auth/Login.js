import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"

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

			const accessToken = response?.data?.access_token
			const role = response?.data?.role

			console.log(accessToken)
			console.log(role)

			setAuth({ user, pass, accessToken, role })

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
			<Col xs={12} lg={4}>
				{showErrMsg 
					?
					<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
				    : null
				}
				<form onSubmit={handleSubmit}>
					<label htmlFor="email">Email</label>
					<input 
						type="email" 
						id="email" 
						className="form-control"
						onChange={(e) => setUser(e.target.value)}
						value={user}
						autoComplete="off"
						required
					/>
					<label htmlFor="password">Password:</label>
	                <input
	                    type="password"
	                    className="form-control"
	                    id="password" 
	                    onChange={(e) => setPass(e.target.value)}
	                    value={pass}
	                    required
	                />
	                <Button variant="success" className="w-100 mt-2" as="input" type="submit" value="Sign in" />
				</form>
				<Link to="/forgetpass" className="text-decoration-none">Forget Password?</Link>
			</Col>
		</Row>
	)
}

export default Login