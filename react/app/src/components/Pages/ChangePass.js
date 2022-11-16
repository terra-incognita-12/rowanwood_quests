import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import axios from "../../api/axios"

const ChangePass = () => {
	const navigate = useNavigate()

	const [pass, setPass] = useState("")
	const [validPass, setValidPass] = useState(false)

	const [confPass, setConfPass] = useState("")
	const [validConfPass, setValidConfPass] = useState(false)

	const { token } = useParams()

	const checkValidToken = async (e) => {
		try {
			const response = await axios.post("/auth/check_valid_change_password_token", JSON.stringify({ "password_token": token }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			console.log(response.data)
		} catch (err) {
			console.log(err)
			navigate("/login", { replace: true})
		}
	}

	useEffect(() => {
		checkValidToken()
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			const response = await axios.post("/auth/confirm_change_password", JSON.stringify({  "password_token": token, "new_password": pass, "new_password_confirm": confPass}),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			navigate("/login", { replace: true})
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<Row className="justify-content-center mt-5">
			<Col xs={12} lg={4}>
				<form onSubmit={handleSubmit}>
					<label htmlFor="password">New password</label>
					<input
	                    type="password"
	                    id="password" 
	                    className="form-control"
	                    onChange={(e) => setPass(e.target.value)}
	                    value={pass}
	                    required
	                />
	                <label htmlFor="confirmPassword">Confirm new Password</label>
	                <input
	                	type="password"
	                	id="confirmPassword"
	                	className="form-control"
	                	onChange={(e) => setConfPass(e.target.value)}
	                	value={confPass}
	                	required
	                />
					<button className="btn btn-success mt-2 w-100">Submit</button>
				</form>
			</Col>
		</Row>
	)
}

export default ChangePass