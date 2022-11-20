import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

import axios from "../../../api/axios"
import ErrMsg from "../../ErrMsg"

const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

const ChangePass = () => {
	const navigate = useNavigate()

	const [pass, setPass] = useState("")
	const [validPass, setValidPass] = useState(false)

	const [confPass, setConfPass] = useState("")
	const [validConfPass, setValidConfPass] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const { token } = useParams()

	const checkValidToken = async (e) => {
		try {
			const response = await axios.post("/auth/check_valid_change_password_token", JSON.stringify({ "password_token": token }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)
		} catch (err) {
			navigate("/login", { replace: true})
		}
	}

	useEffect(() => {
		checkValidToken()
	}, [])

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

		const validPass = PASS_REGEX.test(pass)

		if (!validPass || pass !== confPass) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			return
		}

		try {
			const response = await axios.post("/auth/confirm_change_password", JSON.stringify({  "password_token": token, "new_password": pass, "new_password_confirm": confPass}),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			navigate("/login", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				setErrMsg("Passwords do not match")
			} else if (err.response?.status === 401) {
				setErrMsg("Link is expired. Request again link for change password")
			} else if (err.response?.status === 403) {
				setErrMsg("User no longer exists, or link is invalid")
			} else {
                setErrMsg("Change password failed")
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
						<Form.Label htmlFor="password">New Password</Form.Label>
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
					<Button variant="success" className="w-100 mt-2" as="input" type="submit" value="Submit" />
				</Form>
			</Col>

			<Col xs={12} lg={4}>
				<Card>
					<Card.Body>
						<ul>
							<li><b>Password</b> must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
							</li>
						</ul>
					</Card.Body>
				</Card>
			</Col>
		</Row>
	)
}

export default ChangePass