import { useLocation, useNavigate } from "react-router-dom"
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useAxiosPrivateMultipart from "../../hooks/useAxiosPrivateMultipart"
import useRedirectLogin from "../../hooks/useRedirectLogin"
import LoadingBackdrop from "../Backdrop"

// Must start with the lower case letter and after must followed by 3 to 30 char that can be lowercase, number, - and _
const URL_REGEX = /^[a-z][a-zA-Z0-9-_]{3,30}$/

const CreateQuestForm = () => {
	const [backdropOpen, setBackdropOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const axiosPrivateMultipart = useAxiosPrivateMultipart()
	const redirectLogin = useRedirectLogin(location)

	const [name, setName] = useState("")
	const [briefDesc, setBriefDesc] = useState("")
	const [fullDesc, setFullDesc] = useState("")
	const [url, setUrl] = useState("")
	const [telegramUrl, setTelegramUrl] = useState("")

	const [photo, setPhoto] = useState("")
	const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handlePhotoUploaded = (e) => {
		if (!e.target.files[0]) {
			setIsPhotoUploaded(false)
			setPhoto("")
		} else if (e.target.files[0].size > 2097152) {
			alert("Photo is too big!")
			setIsPhotoUploaded(false)
			setPhoto("")
			return
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

		let questId = ""

		e.preventDefault()

		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 30 char that can be lowercase, number, - and _")
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		try {
			const response = await axiosPrivate.post("/quest/create", JSON.stringify({"name": name, "url": url, "telegram_url": telegramUrl, "brief_description": briefDesc, "full_description": fullDesc, "is_activated": false}))

			questId = response.data.id
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Create Quest Failed")
			}
			handleShowErr(true)
			setBackdropOpen(false)
			window.scrollTo(0, 0)
			return
		}

		if (isPhotoUploaded) {
			let photo_data = new FormData();
			photo_data.append("photo", photo)

			try {
				const response = await axiosPrivateMultipart.patch(`/quest/update/photo/${questId}`, photo_data)
			} catch (err) {
				console.log(err)
				alert("Main info on record created successfully, but it was issue with update photo, please try again")
				window.location.reload(false)
			}
		}
		setBackdropOpen(false)
		alert("Quest created successfuly")
		window.location.reload(false)
	}

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		{showErrMsg
			?
			<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
				: null
		}
		<Card className="mt-3">
			<CardContent>
				<Typography gutterBottom variant="h3" component="div">Create Quest</Typography>
				<Form onSubmit={handleSubmit}>
					<Row className="mt-3 mb-2">
						<Col xs={12} lg={6}>
							<FormControl fullWidth>
								<InputLabel htmlFor="component-outlined">Name</InputLabel>
								<OutlinedInput
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									label="Name"
									required
								/>
								<FormHelperText>Name visible for user</FormHelperText>
							</FormControl>
						</Col>
					</Row>
					<Row className="mb-2">
						<Col xs={12} lg={6} className="mb-2">
							<FormControl fullWidth>
								<InputLabel htmlFor="url">URL (Unique Name)</InputLabel>
								<OutlinedInput
									id="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									label="URL (Unique Name)"
									required
								/>
								<FormHelperText>Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _
								</FormHelperText>
							</FormControl>
						</Col>
						<Col xs={12} lg={6}>
							<FormControl fullWidth>
								<InputLabel htmlFor="telegramUrl">Telegram URL</InputLabel>
								<OutlinedInput
									id="telegramUrl"
									value={telegramUrl}
									onChange={(e) => setTelegramUrl(e.target.value)}
									label="Telegram URL"
									required
								/>
							</FormControl>
						</Col>
					</Row>
					<Row className="mb-2">
						<Col xs={12}>
							<FormControl fullWidth>
								<InputLabel htmlFor="briefDesc">Brief Description</InputLabel>
								<OutlinedInput
									id="briefDesc"
									value={briefDesc}
									onChange={(e) => setBriefDesc(e.target.value)}
									label="Brief Description"
									multiline
									rows={2}
									required
								/>
							</FormControl>
						</Col>
					</Row>
					<Row className="mb-2">
						<Col xs={12}>
							<FormControl fullWidth>
								<InputLabel htmlFor="fullDesc">Full Description</InputLabel>
								<OutlinedInput
									id="fullDesc"
									value={fullDesc}
									onChange={(e) => setFullDesc(e.target.value)}
									label="Full Description"
									multiline
									rows={12}
									required
								/>
							</FormControl>
						</Col>
					</Row>
					<Stack spacing={2} direction="row">
						<Button variant="contained" component="label">
							Upload Photo
							<input hidden accept="image/jpeg" type="file" onChange={handlePhotoUploaded} onClick={handleCleanPhotoUpload} />
						</Button>
						{isPhotoUploaded && photo.name
							? (
							<Stack spacing={1} direction="row">
								<Typography gutterBottom variant="overline" component="div">{photo.name}</Typography>
								<IconButton edge="end" color="error" onClick={handleRemovePhotoBeforeUpload}>
										<CloseIcon />
								</IconButton>
							</Stack>
							)
							: null
						}
					</Stack>
					<div className="mt-3">
						<Button variant="contained" color="success" type="submit">Create Quest</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
		</>
	)
}

export default CreateQuestForm