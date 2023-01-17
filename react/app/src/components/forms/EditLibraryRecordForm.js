import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Link } from "react-router-dom"

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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Icon from '@mui/material/Icon';

import ErrMsg from "../ErrMsg"
import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

// Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _
const URL_REGEX = /^[a-z][a-z0-9-_]{3,23}$/

const EditLibraryRecordForm = ({ record }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)
    const filter = createFilterOptions()

    const recordId = record?.id
    const recordName = record?.name
    const recordUrl = record?.url
    const recordDescription = record?.description
    const recordTags = record?.library_tags

	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [url, setUrl] = useState("")
	
    const [photo, setPhoto] = useState("")
    const [isPhotoUploaded, setIsPhotoUploaded] = useState(false)
	
	const [tags, setTags] = useState([])
	const [inputTags, setInputTags] = useState("")
	const [readyTags, setReadyTags] = useState([])

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(recordName)
		setUrl(recordUrl)
		setDescription(recordDescription)
		setTags(recordTags)
	}, [recordName, recordUrl, recordDescription, recordTags])

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

    const handlePhotoUploaded = (e) => {
        if (!e.target.files[0]) {
            setIsPhotoUploaded(false)
            setPhoto("")
        } else {
            setIsPhotoUploaded(true)
            setPhoto(e.target.files[0])
        }   
    }

	const handleSubmit = async (e) => {
		e.preventDefault()

        !tags && setTags([])

		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
			return
		}
        
        let photo_data = new FormData();
        photo_data.append("photo", photo)

        try {
            await axios.patch(`/library/records/update/photo/${recordId}`, photo_data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        } catch (err) {
            console.log(err)
            return
        }

		try {
			const response = await axiosPrivate.patch(`/library/records/update/${recordId}`, JSON.stringify({"name": name, "url": url, "description": description, "photo": photo.name, "library_tags": tags}))
			navigate(`/library/${url}`, { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 403) {
				setErrMsg("Record with this url already exists")
			} else {
                setErrMsg("Update Record Failed")
            }
            handleShowErr(true)
		}
	}

    const handleDelete = async () => {
        const answer = window.confirm("Are you sure to delete this record?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/library/records/delete/${url}`, JSON.stringify({"url": recordUrl}))
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
                    <Typography gutterBottom variant="h3" component="div">{recordName}</Typography>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete Record</Button>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mt-3 mb-2">
                            <Col xs={12} lg={6} className="mb-2">
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
                            <Col xs={12} lg={6}>
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
                                    value={tags || null}
                                    isOptionEqualToValue={(option, value) => option.name === value.name}
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
                                        value={description || ""}
                                        onChange={(e) => setDescription(e.target.value)}
                                        label="Description"
                                        required
                                    />
                                </FormControl>
                            </Col>
                        </Row>
                        <Stack spacing={3} direction="row">
                            <Button variant="contained" component="label">
                                Upload photo
                                <input hidden accept="image/*" type="file" onChange={handlePhotoUploaded} />
                            </Button>
                            {isPhotoUploaded && photo.name
                                ? <Typography gutterBottom variant="body2" component="div">{photo.name}</Typography>
                                : null
                            }   
                        </Stack>
                        <div className="mt-3">
                            <Button variant="contained" color="success" type="submit">Update Record</Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
		</>
	)
}

export default EditLibraryRecordForm