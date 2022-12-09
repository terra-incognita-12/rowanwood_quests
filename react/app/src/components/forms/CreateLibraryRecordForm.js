import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

// Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _
const URL_REGEX = /^[a-z][a-z0-9-_]{3,23}$/

const CreateLibraryRecordForm = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [url, setUrl] = useState("")
	const [photo, setPhoto] = useState("")
	
	const [tags, setTags] = useState("")
	const [inputTags, setInputTags] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const [readyTags, setReadyTags] = useState([])

	useEffect(() => {
		let isMounted = true
        const controller = new AbortController()

        const getTags = async () => {
            
            try {
                const response = await axiosPrivate.get("/library/tags/all", {
                    signal: controller.signal
                })
                let data = []
                for (let i = 0; i < response.data.length; i++) {
                	let data_dict = {"name": response.data[i].name}
                	data.push(data_dict)
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

	const handleSubmit = async (e) => {
		e.preventDefault()

        !tags && setTags([])

		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.post("/library/records/create", JSON.stringify({"name": name, "url": url, "description": description, "photo": photo, "library_tags": tags}))

			navigate(`/library/${url}`, { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 403) {
				setErrMsg("Record with this url already exists")
			} else {
                setErrMsg("Create Record Failed")
            }
            handleShowErr(true)
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
                                </FormControl>
                            </Col>
                        </Row>
                        <Row className="mb-2">
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
                                </FormControl>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={12} lg={6}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="photo">Photo</InputLabel>
                                    <OutlinedInput
                                        id="photo"
                                        value={photo}
                                        onChange={(e) => setPhoto(e.target.value)}
                                        label="Photo"
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={12} lg={6}>
                                <Autocomplete
                                    multiple
                                    onChange={(e, newValue) => {
                                        setTags(newValue)
                                    }}
                                    onInputChange={(e, newInputValue) => {
                                        setInputTags(newInputValue)
                                    }}
                                    options={readyTags}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField {...params}
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
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
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