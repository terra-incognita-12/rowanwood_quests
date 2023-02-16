import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Alert from "react-bootstrap/Alert"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import LoadingBackdrop from "../Backdrop"

import axios from "../../api/axios"
import ErrMsg from "../ErrMsg"

// Must start with the lower or upper case letter and after must followed by 3 to 23 char that can be lowercase, upper, number, - and _
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/

const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/

// Must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

const Register = () => {
	const [backdropOpen, setBackdropOpen] = useState(false)

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
	const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)

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

	const handlePhotoUploaded = (e) => {
		if (!e.target.files[0]) {
				setIsPhotoUploaded(false)
				setPhoto("")
		} else {
				setIsPhotoUploaded(true)
				setPhoto(e.target.files[0])
		}
	}

	const handleCleanPhotoUpload = (e) => {
			e.target.value = ""
	}

	const handleRemovePhotoBeforeUpload = (e) => {
			setIsPhotoUploaded(false)
			setPhoto("")
	}

	const handleSubmit = async (e) => {
		setBackdropOpen(true)

		let userId = ""

		e.preventDefault()

		const valid1 = USERNAME_REGEX.test(username)
		const valid2 = EMAIL_REGEX.test(email)
		const valid3 = PASS_REGEX.test(pass)

		if (!valid1 || !valid2 || !valid3 || pass !== confPass) {
			setErrMsg("Invalid entry")
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		try {
			const response = await axios.post("/auth/register", JSON.stringify({ "username":username, "email": email, "password": pass, "password_confirm": confPass }),
				{
					headers: {"Content-Type": "application/json"},
					withCredentials: true
				}
			)

			userId = response.data.id
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Registration Failed")
			}
			handleShowErr(true)
			setBackdropOpen(false)
			window.scrollTo(0, 0)
			return
		}

		if (!isPhotoUploaded) {
			alert("Email with confirmation was sent to you!")
		} else {
			let photo_data = new FormData();
			photo_data.append("photo", photo)

			try {
				await axios.patch(`/auth/update_photo/${userId}`, photo_data, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				})
				alert("Email with confirmation was sent to you!")
			} catch (err) {
				console.log(err)
				alert("Main info on record created successfully, but it was issue with update photo, please try again")
			}
		}

		navigate("/login", { replace: true})
	}

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
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
						<InputLabel htmlFor="username">Username</InputLabel>
						<OutlinedInput
							error={!validUsername && username}
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							label="Username"
							required
						/>
						{!validUsername && username
							?
							<FormHelperText sx={{ color: "#fc0303" }}>
								Username must start with the lower or upper case letter and after must followed by 3 to 23 char that can be lowercase, upper, number, - and _
									</FormHelperText>
							: null
						}
					</FormControl>
					<FormControl fullWidth className="mb-3">
						<InputLabel htmlFor="email">Email</InputLabel>
						<OutlinedInput
							error={!validEmail && email}
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							label="Email"
							required
						/>
						{!validEmail && email
							?
							<FormHelperText sx={{ color: "#fc0303" }}>Should be proper email format</FormHelperText>
							: null
						}
					</FormControl>
					<FormControl fullWidth className="mb-3">
						<InputLabel htmlFor="password">Password</InputLabel>
						<OutlinedInput
							error={!validPass && pass}
							id="password"
							type="password"
							value={pass}
							onChange={(e) => setPass(e.target.value)}
							label="Password"
							required
						/>
						{!validPass && pass
							?
							<FormHelperText sx={{ color: "#fc0303" }}>
								Password must be at least one lowercase letter, one uppercase letter, one digit, and one special character and size is 8 to 24
									</FormHelperText>
							: null
						}
					</FormControl>
					<FormControl fullWidth className="mb-3">
						<InputLabel htmlFor="confPass">Confirm Password</InputLabel>
						<OutlinedInput
							error={!validConfPass && confPass}
							id="confPass"
							type="password"
							value={confPass}
							onChange={(e) => setConfPass(e.target.value)}
							label="Confirm Password"
							required
						/>
						{!validConfPass && confPass
							?
							<FormHelperText sx={{ color: "#fc0303" }}>Passwords should be matching</FormHelperText>
							: null
						}
						</FormControl>
						<Stack spacing={2} direction="row" className="mb-2">
							<Button variant="contained" component="label">
								Upload Photo
								<input hidden accept="image/*" type="file" onChange={handlePhotoUploaded} onClick={handleCleanPhotoUpload} />
							</Button>
							{isPhotoUploaded && photo.name
								? (
								<Stack spacing={1} direction="row">
										<Typography gutterBottom variant="overline" component="div">{photo.name}</Typography>
										<IconButton edge="end" color="error" onClick={handleRemovePhotoBeforeUpload}>
												<CloseIcon />
										</IconButton>
								</Stack>
								) : null
							}
						</Stack>
						<Button variant="contained" color="success" type="submit" fullWidth>Create Account</Button>
					</Form>
					<Typography display="flex" justifyContent="center" alignItems="center"><Button component={Link} to="/login">Back to Login</Button></Typography>
									</CardContent>
				</Card>
			</Col>
		</Row>
		</>
	)
}

export default Register