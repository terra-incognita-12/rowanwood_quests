import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from 'react-bootstrap/Card'

import axios from "../../api/axios"

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

	const handleSubmit = async (e) => {
		e.preventDefault()

		const i1 = USERNAME_REGEX.test(username)
		const i2 = EMAIL_REGEX.test(email)
		const i3 = PASS_REGEX.test(pass)

		if (!i1 || !i2 || !i3 || pass !== confPass) {
			setErrMsg("Invalid entry")
			return
		}

		try {
			const response = await axios.post("/auth/register", JSON.stringify({ "username":username, "email": email, "photo": photo, "password": pass, "password_confirm": confPass }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			console.log(response.data)
            console.log(JSON.stringify(response))

            alert("Email with confirmation was sent to you!")

            navigate("/login", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				setErrMsg("asswords do not match")
			} else if (err.response?.status === 403) {
				setErrMsg("Account with this credentials already exists")
			} else if (err.response?.status === 500) {
				setErrMsg("There was an error sending email")
			} else {
                setErrMsg("Registration Failed")
            }
		}
	}

	useEffect(() => {
		const result = USERNAME_REGEX.test(username)
		setValidUsername(result)
	}, [username])

	useEffect(() => {
		const result = EMAIL_REGEX.test(email)
		setValidEmail(result)
	})

	useEffect(() => {
		const result = PASS_REGEX.test(pass)
		setValidPass(result)
	}, [pass])

	useEffect(() => {
		setValidConfPass(pass === confPass && validPass) 
	}, [confPass])

	return (
		<Row className="justify-content-center mt-5">
			<Col xs={12} lg={4}>
				<span className={errMsg ? "text-danger": "d-none"}>{errMsg}</span>
				<form onSubmit={handleSubmit}>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						className={validUsername && username
						 	? "is-valid form-control" 
						 	: !validUsername && username
						 		? "is-invalid form-control"
						 		: "form-control"
						}
						onChange={(e) => setUsername(e.target.value)}
						value={username}
						autoComplete="off"
						required
					/>
					<label htmlFor="email">Email</label>
					<input 
						type="email" 
						id="email" 
						className={validEmail && email
						 	? "is-valid form-control" 
						 	: !validEmail && email
						 		? "is-invalid form-control"
						 		: "form-control"
						}
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						autoComplete="off"
						required
					/>
					<label htmlFor="password">Password</label>
	                <input
	                    type="password"
	                    id="password" 
	                    className={validPass && pass
						 	? "is-valid form-control" 
						 	: !validPass && pass
						 		? "is-invalid form-control"
						 		: "form-control"
						}
	                    onChange={(e) => setPass(e.target.value)}
	                    value={pass}
	                    required
	                />
	                <label htmlFor="confirmPassword">Confirm Password</label>
	                <input
	                	type="password"
	                	id="confirmPassword"
	                	className={validConfPass && confPass
						 	? "is-valid form-control" 
						 	: !validConfPass && confPass
						 		? "is-invalid form-control"
						 		: "form-control"
						}
	                	onChange={(e) => setConfPass(e.target.value)}
	                	value={confPass}
	                	required
	                />
	                <label htmlFor="photo">Photo</label>
					<input 
						type="text" 
						id="photo" 
						className="form-control"
						onChange={(e) => setPhoto(e.target.value)}
						value={photo}
						autoComplete="off"
						required
					/>
	                <button className="btn btn-success mt-2 w-100">Sign up</button>
				</form>
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