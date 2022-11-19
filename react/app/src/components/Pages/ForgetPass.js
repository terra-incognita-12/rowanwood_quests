import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

import axios from "../../api/axios"
import ErrMsg from "../ErrMsg"

const ForgetPass = () => {
	const navigate = useNavigate()

	const [email, setEmail] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			await axios.post("auth/forget_password", JSON.stringify({ "email": email }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			alert("Email with recovery link was sent to you!")

			navigate("/login", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 401) {
				setErrMsg("User with this email don't exsist")
			} else if (err.response?.status === 403) {
				setErrMsg("Your email is not verified, please verify your email address, link was sent on your email")
			} else if (err.response?.status === 500) {
				setErrMsg("There was an error sending email")
			} else {
                setErrMsg("Registration Failed")
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
				<Form onSubmit={handleSubmit}>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="email">Recover Email</Form.Label>
						<Form.Control 
							type="email"
							id="email"
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							autoComplete="off"
							required
						/>
					</Form.Group>
					<Button variant="success" className="w-100 mt-2" as="input" type="submit" value="Send recovery link" />
				</Form>
				<div className="text-center mt-1">
					<Link to="/login" className="text-decoration-none">Back to login</Link>
				</div>
			</Col>
		</Row>
	)
}

export default ForgetPass