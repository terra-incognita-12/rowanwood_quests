import { useState } from "react"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import axios from "../../api/axios"

const Login = () => {

	const [user, setUser] = useState("")
	const [pass, setPass] = useState("")
	const [errMsg, setErrMsg] = useState("")

	const handleSubmit = async (e) => {
		e.preventDefault()

		console.log(user)
		console.log(pass)

		try {
			const result = await axios.post("/auth/login", JSON.stringify({"email": user, "password": pass}),
				{
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					withCredentials: true
				}
			)

			console.log(result?.data)
			// const accessToken = res?.data?.access_token
			// const role = res?.data?.role
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<div className="">
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
					</form>
				</Col>
			</Row>
			
		</div>
	)
}

export default Login