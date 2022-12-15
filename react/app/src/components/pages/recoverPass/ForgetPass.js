import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
// import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import axios from "../../../api/axios"
import ErrMsg from "../../ErrMsg"

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
		                            id="email"
		                            type="email"
		                            value={email}
		                            onChange={(e) => setEmail(e.target.value)}
		                            label="Email"
		                            required
		                        />
		                    </FormControl>
							<Button variant="contained" color="success" type="submit" fullWidth>Send Email</Button>
						</Form>
						<Typography display="flex" justifyContent="center" alignItems="center">
							<Button component={Link} to="/login">Back to Login</Button>
						</Typography>
                	</CardContent>
				</Card>
			</Col>
		</Row>
	)
}

export default ForgetPass