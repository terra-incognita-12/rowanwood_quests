import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Link } from "react-router-dom"

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
import useAxiosPrivateMultipart from "../../hooks/useAxiosPrivateMultipart"
import useRedirectLogin from "../../hooks/useRedirectLogin"
import LoadingBackdrop from "../Backdrop"

// Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _
const URL_REGEX = /^[a-z][a-z0-9-_]{3,23}$/

const EditLibraryRecordForm = ({ record }) => {
    const [backdropOpen, setBackdropOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
    const axiosPrivateMultipart = useAxiosPrivateMultipart()
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

		e.preventDefault()

        !tags && setTags([])

		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
            window.scrollTo(0, 0);
            setBackdropOpen(false)
            return
		}

		try {
			const response = await axiosPrivate.patch(`/library/records/update/${recordId}`, JSON.stringify({"name": name, "url": url, "description": description, "library_tags": tags}))
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
                setErrMsg("Update Record Failed")
            }
            handleShowErr(true)
            setBackdropOpen(false)
            window.scrollTo(0, 0)
            return
		}

        if (!isPhotoUploaded) {
            navigate(`/library/${url}`, { replace: true})
        } else {
            let photo_data = new FormData();
            photo_data.append("photo", photo)

            try {
                const response = await axiosPrivateMultipart.patch(`/library/records/update/photo/${recordId}`, photo_data)
                navigate(`/library/${url}`, { replace: true})
            } catch (err) {
                if (!err?.response) {
                    setErrMsg("No server respone")
                } else if (err?.response?.status === 400) {
                    redirectLogin()
                } else if (err?.response?.status) {
                    setErrMsg(err?.response?.data?.detail)
                } else {
                    setErrMsg("Main info on record updated successfully, but it was issue with update photo, please try again")
                }
                handleShowErr(true)
                window.scrollTo(0, 0)
            }
        }
        setBackdropOpen(false)
	}

    const handleDeletePhoto = async () => {
        const answer = window.confirm("Are you sure to delete this photo?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/library/records/delete/photo/${recordId}`)
            window.location.reload(false);
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No server respone")
            } else if (err?.response?.status === 400) {
                redirectLogin()
            } else if (err?.response?.status) {
                setErrMsg(err?.response?.data?.detail)
            } else {
                setErrMsg("Delete Record Photo Failed")
            }
            handleShowErr(true)
            window.scrollTo(0, 0)
        } finally {
            setBackdropOpen(false)
        }
    }
    
    const handleDelete = async () => {
        const answer = window.confirm("Are you sure to delete this record?")
        if (!answer) { return }

        setBackdropOpen(true)    

        try {
            await axiosPrivate.delete(`/library/records/delete/${url}`, JSON.stringify({"url": recordUrl}))
            window.location.reload(false);
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No server respone")
            } else if (err?.response?.status === 400) {
                redirectLogin()
            } else if (err?.response?.status) {
                setErrMsg(err?.response?.data?.detail)
            } else {
                setErrMsg("Delete Record Failed")
            }
            handleShowErr(true)
            window.scrollTo(0, 0)
        } finally {
            setBackdropOpen(false)
        }
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography gutterBottom variant="h3" component="div">{recordName}</Typography>
                            <Button variant="contained" color="error" onClick={handleDelete}>Delete Record</Button>
                        </Box>
                        {record.photo
                            ? (
                                <Box
                                    component="img"
                                    sx={{
                                        height: 150,
                                        width: 150,
                                        borderRadius: '8px',
                                    }}
                                    alt="Photo"
                                    src={record.photo}
                                />
                            )
                            : null
                        }
                        
                    </Box>
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
                                )
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