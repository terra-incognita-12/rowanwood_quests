import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import axios from "../../api/axios"

const ForgetPass = () => {
	const navigate = useNavigate()

	const [email, setEmail] = useState("")

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			const response = await axios.post("auth/forget_password", JSON.stringify({ "email": email }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			alert("Email with recovery link was sent to you!")

			navigate("/login", { replace: true})
		} catch (err) {
			console.log(err)
		}	
	}

	return (
		<Row className="justify-content-center mt-5">
			<Col xs={12} lg={4}>
				<form onSubmit={handleSubmit}>
					<label htmlFor="email">Recovery email</label>
					<input 
						type="email" 
						id="email"
						className="form-control"
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						autoComplete="off"
						required 
					/>
					<button className="btn btn-success mt-2 w-100">Send recovery link</button>
					<Link to="/login">Back to login</Link>
				</form>
			</Col>
		</Row>
	)
}

export default ForgetPass