import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from '@mui/material/Button';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
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

import ErrMsg from '../ErrMsg'
import axios from "../../api/axios"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAxiosPrivateMultipart from "../../hooks/useAxiosPrivateMultipart"
import useRedirectLogin from '../../hooks/useRedirectLogin'
import LoadingBackdrop from "../Backdrop"

// Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _
const URL_REGEX = /^[a-z][a-zA-Z0-9-_]{3,23}$/

const CreateLibraryRecordForm = () => {
	const [backdropOpen, setBackdropOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const axiosPrivateMultipart = useAxiosPrivateMultipart()
	const redirectLogin = useRedirectLogin(location)
	const filter = createFilterOptions()

	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [url, setUrl] = useState("")

	const [photo, setPhoto] = useState("")
	const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)

	const [tags, setTags] = useState([])
	const [inputTags, setInputTags] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const [readyTags, setReadyTags] = useState([])

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const getTags = async () => {
				
			try {
				const response = await axios.get("/library/tags/all", {
						signal: controller.signal
				})
				let data = []
				for (const tag of response.data) {
					data.push({"name": tag.name})
				}
				isMounted && setReadyTags(data)
			} catch (err) {
					console.log(err)
			}
		}

		getTags()

		return () => {
			isMounted = false
			controller.abort()
		}

	}, [])

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handlePhotoUploaded = (e) => {
		if (!e.target.files[0]) {
			setIsPhotoUploaded(false)
			setPhoto("")
		} else if (e.target.files[0].size > 1048576) {
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
		let recordId = ""

		e.preventDefault()

		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		try {
			const response = await axiosPrivate.post("/library/records/create", JSON.stringify({"name": name, "url": url, "description": description, "library_tags": tags}))
						recordId = response.data.id
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Create Record Failed")
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
				const response = await axiosPrivateMultipart.patch(`/library/records/update/photo/${recordId}`, photo_data)
			} catch (err) {
				console.log(err)
				alert("Main info on record created successfully, but it was issue with update photo, please try upload photo again")
				window.location.reload(false)
			}
		}
		setBackdropOpen(false)
		alert("Record created successfuly")
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
				<Typography gutterBottom variant="h3" component="div">Create Record</Typography>
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
						<Col xs={12} lg={6}>
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
					</Row>
					<Row className="mb-2">
						<Col xs={12} lg={6}>
							<Autocomplete
								multiple
								onChange={(e, newValue) => {
									if (typeof newValue === 'string') {
										setTags({
											name: newValue,
										});
									} else if (newValue && newValue.inputValue) {
										setTags({
											name: newValue.inputValue,
										});
									} else {
										setTags(newValue);
									}
								}}
								onInputChange={(e, newInputValue) => {
									setInputTags(newInputValue)
								}}
								filterOptions={(options, params) => {
									const filtered = filter(options, params);

									const { inputValue } = params;
									const isExisting = options.some((option) => inputValue === option.name);
									if (inputValue !== '' && !isExisting) {
										filtered.push({
											inputValue,
											name: inputValue.toLowerCase().replaceAll(" ", "_"),
										});
									}

									return filtered;
								}}
								options={readyTags}
								getOptionLabel={(option) => option.name}
								renderInput={(params) => (
									<TextField
											{...params}
											label="Tags"
											placeholder="Input tags"
											id="tags"
									/>
								)}
							/>
						</Col>
					</Row>
					<Row className="mb-2">
						<Col xs={12}>
							<FormControl fullWidth>
								<InputLabel htmlFor="description">Description</InputLabel>
								<OutlinedInput
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									label="Description"
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
							) : null
						}
					</Stack>
					<div className="mt-3">
						<Button variant="contained" color="success" type="submit">Create Record</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
		</>
	)
}

export default CreateLibraryRecordForm