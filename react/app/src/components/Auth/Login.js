import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import axios from "../../api/axios"
import useAuth from "../../hooks/useAuth"

const Login = () => {
	const [user, setUser] = useState("")
	const [pass, setPass] = useState("")
	const [errMsg, setErrMsg] = useState("")

	const navigate = useNavigate()
	const location = useLocation()
	const from = location.state?.from?.pathname || "/"

	const { setAuth } = useAuth()

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
			console.log(err)
			if (!err?.response) {
				setErrMsg("No response from server")
			} else if (err.response?.status === 422) {
				setErrMsg("Input error")
			} else if (err.response?.status === 401) {
				setErrMsg("Incorrect Email or Password")
			} else if (err.response?.status === 403) {
				setErrMsg("Your email is not verified, please verify your email address, link was sent on your email")
			} else {
				setErrMsg("Login Failed")
			}
		}
	}

	return (
		<Row className="justify-content-center mt-5">
			<Col xs={12} lg={4}>
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
	                <button className="btn btn-success mt-2 w-100">Sign in</button>
	                <span className={errMsg ? "text-danger": "d-none"}>{errMsg}</span>
	                <Link to="/forgetpass">Forget Password?</Link>
				</form>
			</Col>
		</Row>
	)
}

export default Login