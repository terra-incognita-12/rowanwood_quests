import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Alert from "react-bootstrap/Alert"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

import axios from "../../api/axios"
import ErrMsg from "../ErrMsg"

// Must start with the lower or upper case letter and after must followed by 3 to 23 char that can be lowercase, upper, number, - and _
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/

const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/

// Must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

const Register = () => {
	const navigate = useNavigate()

	const [username, setUsername] = useState("")
	const [validUsername, setValidUsername] = useState(false)

	const [email, setEmail] = useState("")
	const [validEmail, setValidEmail] = useState(false)

	const [pass, setPass] = useState("")
	const [validPass, setValidPass] = useState(false)

	const [confPass, setConfPass] = useState("")
	const [validConfPass, setValidConfPass] = useState(false)

	const [photo, setPhoto] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		const result = USERNAME_REGEX.test(username)
		setValidUsername(result)
	}, [username])

	useEffect(() => {
		const result = EMAIL_REGEX.test(email)
		setValidEmail(result)
	}, [email])

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
		e.preventDefault()

		const valid1 = USERNAME_REGEX.test(username)
		const valid2 = EMAIL_REGEX.test(email)
		const valid3 = PASS_REGEX.test(pass)

		if (!valid1 || !valid2 || !valid3 || pass !== confPass) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			return
		}

		try {
			const response = await axios.post("/auth/register", JSON.stringify({ "username":username, "email": email, "photo": photo, "password": pass, "password_confirm": confPass }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

            alert("Email with confirmation was sent to you!")

            navigate("/login", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				setErrMsg("Passwords do not match")
			} else if (err.response?.status === 403) {
				setErrMsg("Account with this credentials already exists")
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
				<Link to="/login" className="btn btn-primary mb-3">Back to login</Link>
				<Form onSubmit={handleSubmit}>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="username">Username</Form.Label>
						<Form.Control 
							type="text"
							id="username"
							className={validUsername && username
							 	? "is-valid" 
							 	: !validUsername && username
							 		? "is-invalid"
							 		: ""
							}
							onChange={(e) => setUsername(e.target.value)}
							value={username}
							autoComplete="off"
							required
						/>
					</Form.Group> 
					<Form.Group className="mb-1">
						<Form.Label htmlFor="email">Email</Form.Label>
						<Form.Control 
							type="email" 
							id="email" 
							className={validEmail && email
						 		? "is-valid" 
						 		: !validEmail && email
						 			? "is-invalid"
						 			: ""
							}
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						autoComplete="off"
						required
						/>
					</Form.Group>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="password">Password</Form.Label>
						<Form.Control 
		                    type="password"
	                    	id="password" 
	                    	className={validPass && pass
						 		? "is-valid" 
						 		: !validPass && pass
						 			? "is-invalid"
						 			: ""
							}
	                    	onChange={(e) => setPass(e.target.value)}
	                    	value={pass}
	                    	required
						/> 
					</Form.Group>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="confPassword">Confirm Password</Form.Label>
						<Form.Control 
		                    type="password"
	                    	id="confPassword" 
	                    	className={validConfPass && confPass
						 		? "is-valid" 
						 		: !validConfPass && confPass
						 			? "is-invalid"
						 			: ""
							}
	                    	onChange={(e) => setConfPass(e.target.value)}
	                    	value={confPass}
	                    	required
						/> 
					</Form.Group>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="photo">Photo</Form.Label>
						<Form.Control 
							type="text" 
							id="photo" 
							onChange={(e) => setPhoto(e.target.value)}
							value={photo}
							autoComplete="off"
							required
						/>
					</Form.Group>
					<Button variant="success" className="w-100 mt-2" as="input" type="submit" value="Sign up" />
				</Form>
			</Col>

			<Col xs={12} lg={4}>
				<Card>
					<Card.Body>
						<ul>
							<li><b>Username</b> must start with the lower or upper case letter and after must followed by 3 to 23 char that can be lowercase, upper, number, - and _
							</li>
							<li><b>Password</b> must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
							</li>
						</ul>
					</Card.Body>
				</Card>
			</Col>
		</Row>
	)
}

export default Register