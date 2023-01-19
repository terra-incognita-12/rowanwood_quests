import { useLocation, useNavigate, Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import ErrMsg from "../ErrMsg"
import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const URL_REGEX = /^[a-z][a-z0-9-_]{3,30}$/

const EditQuestForm = ({ quest }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const questId = quest?.id
    const questName = quest?.name
    const questBriefDesc = quest?.brief_description
    const questFullDesc = quest?.full_description
    const questUrl = quest?.url
    const questTelegramUrl = quest?.telegram_url
    const questPhoto = quest?.photo

	const [name, setName] = useState("")
	const [briefDesc, setBriefDesc] = useState("")
	const [fullDesc, setFullDesc] = useState("")
	const [url, setUrl] = useState("")
	const [telegramUrl, setTelegramUrl] = useState("")

	const [photo, setPhoto] = useState("")
    const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(questName)
		setBriefDesc(questBriefDesc)
		setFullDesc(questFullDesc)
		setUrl(questUrl)
		setTelegramUrl(questTelegramUrl)
		setPhoto(questPhoto)
	}, [questName, questBriefDesc, questFullDesc, questUrl, questTelegramUrl, questPhoto])


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
		e.preventDefault()
		
		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 30 char that can be lowercase, number, - and _")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.patch(`/quest/update/${questId}`, JSON.stringify({"name": name, "url": url, "telegram_url": telegramUrl, "brief_description": briefDesc, "full_description": fullDesc, "photo": photo}))
		} catch (err) {
			if (!err?.response) {
                setErrMsg("No server respone")
            } else if (err.response?.status === 400) {
                redirectLogin()
            } else if (err.response?.status === 403) {
                setErrMsg("Quest with this url already exists")
            } else if (err.response?.status === 404) {
                setErrMsg("Quest doesn't exist")
            } else {
                setErrMsg("Edit Quest Failed")
            }
            handleShowErr(true)
		}

        if (!isPhotoUploaded) {
            navigate(`/quest/${url}`, { replace: true})
        } else {
            let photo_data = new FormData();
            photo_data.append("photo", photo)

            try {
                await axios.patch(`/quest/update/photo/${questId}`, photo_data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                navigate(`/quest/${url}`, { replace: true})
            } catch (err) {
                console.log(err)
                alert("Main info on quest updated successfully, but it was issue with update photo, please try again")
            }
        }
	}

    const handleDeletePhoto = async () => {
        const answer = window.confirm("Are you sure to delete this photo?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/quest/delete/photo/${questId}`)
            window.location.reload(false);
        } catch (err) {
            console.log(err)
        }
    }

	const handleDelete = async () => {
        const answer = window.confirm("Are you sure to delete this quest?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/quest/delete/${url}`, JSON.stringify({"url": questUrl}))
            window.location.reload(false);
        } catch (err) {
            console.log(err)
        }
    }

	return (
		<>
			{showErrMsg 
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
			    : null
			}

			<Card className="mt-3">
                <CardContent>
                    <Stack spacing={2} direction="row" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography gutterBottom variant="h3" component="div">{questName}</Typography>
                            <Stack spacing={1} direction="row">
                                <Button component={Link} to={`${questUrl}`} variant="contained" color="primary">Edit Lines</Button>
                                <Button variant="contained" color="error" onClick={handleDelete}>Delete Quest</Button>
                            </Stack>
                        </Box>
                        {questPhoto
                            ? (
                                <Box
                                    component="img"
                                    sx={{
                                        height: 150,
                                        width: 150,
                                        borderRadius: '8px',
                                    }}
                                    alt="Photo"
                                    src={questPhoto}
                                />
                            )
                            : null
                        }
                        
                    </Stack>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mt-3 mb-2">
                            <Col xs={12} lg={6}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-outlined">Name</InputLabel>
                                    <OutlinedInput
                                        id="name"
                                        value={name || ""}
                                        onChange={(e) => setName(e.target.value)}
                                        label="Name"
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={12} lg={6} className="mb-2">
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="url">URL (Unique Name)</InputLabel>
                                    <OutlinedInput
                                        id="url"
                                        value={url || ""}
                                        onChange={(e) => setUrl(e.target.value)}
                                        label="URL (Unique Name)"
                                        required
                                    />
                                </FormControl>
                            </Col>
                            <Col xs={12} lg={6}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="telegramUrl">Telegram URL</InputLabel>
                                    <OutlinedInput
                                        id="telegramUrl"
                                        value={telegramUrl || ""}
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
                                        value={briefDesc || ""}
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
                                        value={fullDesc || ""}
                                        onChange={(e) => setFullDesc(e.target.value)}
                                        label="Full Description"
                                        multiline
                                        rows={12}
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
                        <Stack spacing={1} direction="row">
                            <Button variant="contained" component="label" color="error" onClick={handleDeletePhoto}>
                                Delete Photo
                            </Button>
                            <Button variant="contained" component="label">
                                Upload new photo
                                <input hidden accept="image/*" type="file" onChange={handlePhotoUploaded} onClick={handleCleanPhotoUpload}/>
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
                            <Button variant="contained" color="success" type="submit">Update Quest</Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
		</>
	)
}

export default EditQuestForm