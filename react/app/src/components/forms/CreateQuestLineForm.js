import { useLocation, useNavigate } from "react-router-dom"
import { useState } from 'react'

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
import Toolbar from '@mui/material/Toolbar';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useRedirectLogin from '../../hooks/useRedirectLogin'

const CreateQuestLineForm = ({ handleLineModalClose, questLinesList, url }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const [name, setName] = useState("")
	const [uniqueNum, setUniqueNum] = useState("")
	const [description, setDescription] = useState("")
	const [photo, setPhoto] = useState("")
	const [questOptions, setQuestOptions] = useState([{ name: "", quest_next_line_id: "" }])

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}
 
	const addNewOptionField = () => {
	    let newOptionField = { name: "", quest_next_line_id: "" }
	    setQuestOptions([...questOptions, newOptionField])
	}

	const removeOptionField = (i) => {
	    let optionField = [...questOptions];
	    optionField.splice(i, 1)
	    setQuestOptions(optionField)
	}

	const handleSubmit = async (e) => {
		setPhoto("some_photo")

		e.preventDefault()

		try {
			const response = await axiosPrivate.post(`/quest/lines/create/${url}`, JSON.stringify({"name": name, "unique_number": uniqueNum, "description": description, "photo": photo, "quest_current_options": questOptions}))

			window.location.reload(false);
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 403) {
				setErrMsg("Quest line with this unique number already exists")
			} else {
                setErrMsg("Create Quest Line Failed")
            }
            handleShowErr(true)
		}
			
	}

	return (
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
	            <div className="mt-3">
	                <Button variant="contained" component="label">
	                    Upload photo
	                    <input hidden accept="image/*" multiple type="file" />
	                </Button>
	            </div>
	            <div className="mt-3">
	                <Button variant="contained" color="success" type="submit">Create Line</Button>
	            </div>
	        </Form>
		</Container>
	)
}

export default CreateQuestLineForm