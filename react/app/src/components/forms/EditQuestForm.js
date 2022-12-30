import { useLocation, useNavigate, Link } from "react-router-dom"
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
import Stack from '@mui/material/Stack';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const URL_REGEX = /^[a-z][a-z0-9-_]{3,23}$/

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

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.patch(`/quest/update/${questId}`, JSON.stringify({"name": name, "url": url, "telegram_url": telegramUrl, "brief_description": briefDesc, "full_description": fullDesc, "photo": photo}))

			navigate(`/quest/${url}`, { replace: true })
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
                setErrMsg("Create Quest Failed")
            }
            handleShowErr(true)
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
                    <Typography gutterBottom variant="h3" component="div">{questName}</Typography>
                    <Stack spacing={2} direction="row">
                    	<Button component={Link} to={`${questUrl}`} variant="contained" color="primary">Edit Quest Details</Button>
                    	<Button variant="contained" color="error" onClick={handleDelete}>Delete Quest</Button>
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
                            <Col xs={12} lg={6}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="briefDesc">Brief Description</InputLabel>
                                    <OutlinedInput
                                        id="briefDesc"
                                        value={briefDesc || ""}
                                        onChange={(e) => setBriefDesc(e.target.value)}
                                        label="Brief Description"
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
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <Button variant="contained" component="label">
                                Upload photo
                                <input hidden accept="image/*" multiple type="file" />
                            </Button>
                        </div>
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