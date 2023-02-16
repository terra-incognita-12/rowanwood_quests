import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'

import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Toolbar from '@mui/material/Toolbar';

import ErrMsg from "../ErrMsg"
import axios from "../../api/axios"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAxiosPrivateMultipart from "../../hooks/useAxiosPrivateMultipart"
import useRedirectLogin from '../../hooks/useRedirectLogin'
import LoadingBackdrop from "../Backdrop"

const EditQuestLineForm = ({ handleNewLineModalClose, questLine, questLinesList, url }) => {
	const [backdropOpen, setBackdropOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const axiosPrivateMultipart = useAxiosPrivateMultipart()
	const redirectLogin = useRedirectLogin(location)

	const questLineId = questLine?.id
	const questLineName = questLine?.name
	const questLineUniqueNum = questLine?.unique_number
	const questLineDesc = questLine?.description
	const questLineOptions = questLine?.quest_current_options

	const [name, setName] = useState("")
	const [uniqueNum, setUniqueNum] = useState("")
	const [description, setDescription] = useState("")

	const [photo, setPhoto] = useState("")
	const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)

	const [questOptions, setQuestOptions] = useState([{ "name": "", "quest_next_line_id": "" }])

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(questLineName)
		setUniqueNum(questLineUniqueNum)
		setDescription(questLineDesc)

		let newQuestOptions = []
		for (const option of questLineOptions) {
			let newOptionField = { "name": option.name, "quest_next_line_id": option.quest_next_line.id }
			newQuestOptions.push(newOptionField)
		}
		setQuestOptions(newQuestOptions)

	}, [questLineName, questLineUniqueNum, questLineDesc, questLineOptions])

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}
 
	const addNewOptionField = () => {
		let newOptionField = { "name": "", "quest_next_line_id": "" }
		setQuestOptions([...questOptions, newOptionField])
	}

	const removeOptionField = (i) => {
		let optionField = [...questOptions];
		optionField.splice(i, 1)
		setQuestOptions(optionField)
	}

	const getQuestNameById = (id) => {
		for (const line of questLinesList) {
			if (line.id === id) {
				return line.name
			}
		}

		return "NaN"
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

	const handleDeletePhoto = async () => {
		const answer = window.confirm("Are you sure to delete this photo?")
		if (!answer) { return }

		setBackdropOpen(true)

		try {
				await axiosPrivate.delete(`/quest/lines/delete/photo/${questLineId}`)
				window.location.reload(false);
		} catch (err) {
				if (!err?.response) {
						setErrMsg("No server respone")
				} else if (err?.response?.status === 400) {
						redirectLogin()
				} else if (err?.response?.status) {
						setErrMsg(err?.response?.data?.detail)
				} else {
						setErrMsg("Delete Line Photo Failed")
				}
		} finally {
			setBackdropOpen(false)
		}
	}

	const handleSubmit = async (e) => {
		setBackdropOpen(true)

		e.preventDefault()

		try {
			const response = await axiosPrivate.patch(`/quest/lines/update/${questLineId}`, JSON.stringify({"name": name, "unique_number": uniqueNum, "description": description, "quest_current_options": questOptions}))
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Update Line Failed")
			}
			handleShowErr(true)
			setBackdropOpen(false)
			return
		}

		if (isPhotoUploaded) {
			let photo_data = new FormData();
			photo_data.append("photo", photo)

			try {
				const response = await axiosPrivateMultipart.patch(`/quest/lines/update/photo/${questLineId}`, photo_data)
			} catch (err) {
				console.log(err)
				setBackdropOpen(false)
				alert("Main info on quest line updated successfully, but it was issue with update photo, please try again")
			}
		}
		navigate("/editor/quest/edit/training", { replace: true})
	}

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		<Container className="mt-5">
			{showErrMsg
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
					: null
			}
			<Form onSubmit={handleSubmit}>
				<Row className="mb-2">
					<Col xs={12} lg={6} className="mb-2">
						<FormControl fullWidth>
							<InputLabel htmlFor="component-outlined">Name</InputLabel>
							<OutlinedInput
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								label="Name"
								required
							/>
							<FormHelperText>Name of line</FormHelperText>
						</FormControl>
					</Col>
					<Col xs={12} lg={6}>
						<FormControl fullWidth>
							<InputLabel htmlFor="url">Unique Number</InputLabel>
							<OutlinedInput
								id="unique_num"
								value={uniqueNum}
								type="number"
								onChange={(e) => setUniqueNum(e.target.value)}
								label="URL (Unique Name)"
								required
							/>
							<FormHelperText>Number like a page in a book, should be unique within quest</FormHelperText>
						</FormControl>
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
								rows={7}
								required
							/>
						</FormControl>
					</Col>
				</Row>
				<hr/>
				<div className="mb-3">
					<Button variant="contained" color="success" onClick={addNewOptionField}>Add options</Button>
				</div>
				{questOptions.map((elem, i) => (
					<Row key={i} className="mt-1">
						<Toolbar>
							<IconButton edge="start" color="error" onClick={() => removeOptionField(i)}>
								<RemoveCircleOutlineIcon />
							</IconButton>
							<Typography sx={{ ml: 2, flex: 1 }} variant="h6">Option #{i+1}</Typography>
						</Toolbar>
						<Col xs={12} lg={6} className="mb-2">
							<FormControl fullWidth>
								<InputLabel htmlFor="url">Quest Option Name</InputLabel>
								<OutlinedInput
									name="name"
									value={elem.name}
									onChange={(e) => {
										let newQuestOptions = [...questOptions]
										newQuestOptions[i]["name"] = e.target.value
										setQuestOptions(newQuestOptions)
									}}
									label="Quest Option Name"
									required
								/>
							</FormControl>
						</Col>
						<Col xs={12} lg={6}>
							<FormControl fullWidth>
								<Autocomplete
									defaultValue={
										questLineOptions[i]
											?
										{ name: getQuestNameById(questLineOptions[i].quest_next_line.id), quest_next_line_id:questLineOptions[i].quest_next_line.id }
											:
											null
										}
									disablePortal
									id="combo-box-demo"
									options={questLinesList}
									onChange={(e, newValue) => {
										let newQuestOptions = [...questOptions]
										newQuestOptions[i]["quest_next_line_id"] = newValue.id
										setQuestOptions(newQuestOptions)
									}}
									getOptionLabel={(option) => option.name}
										renderInput={(params) => <TextField fullWidth {...params} label="Next Line" />}
								/>
							</FormControl>
						</Col>
					</Row>
				))}
				<Stack spacing={1} direction="row">
					<Button variant="contained" component="label" color="error" onClick={handleDeletePhoto}>
						Delete Photo
					</Button>
					<Button variant="contained" component="label">
						Upload new photo
						<input hidden accept="image/jpeg" type="file" onChange={handlePhotoUploaded} onClick={handleCleanPhotoUpload}/>
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
					<Button variant="contained" color="success" type="submit">Update Line</Button>
				</div>
			</Form>
		</Container>
		</>
	)
}

export default EditQuestLineForm