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

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useRedirectLogin from '../../hooks/useRedirectLogin'

const EditQuestLineForm = ({ handleNewLineModalClose, questLine, questLinesList, url }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const questLineId = questLine?.id
    const questLineName = questLine?.name
    const questLineUniqueNum = questLine?.unique_number
    const questLineDesc = questLine?.description
    const questLineOptions = questLine?.quest_options

	const [name, setName] = useState("")
	const [uniqueNum, setUniqueNum] = useState("")
	const [description, setDescription] = useState("")
	const [photo, setPhoto] = useState("")
	const [questOptions, setQuestOptions] = useState([{ name: "", quest_next_line_id: "" }])

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(questLineName)
		setUniqueNum(questLineUniqueNum)
		setDescription(questLineDesc)

		let newQuestOptions = []
		for (let i = 0; i < questLineOptions.length; i++) {
			let newOptionField = { name: questLineOptions[i].name, quest_next_line_id:questLineOptions[i].quest_next_line.id }
			newQuestOptions.push(newOptionField)
		}
		console.log(newQuestOptions)
		setQuestOptions(newQuestOptions)

	}, [questLineName, questLineUniqueNum, questLineDesc, questLineOptions])

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

	const getQuestNameById = (id) => {
		console.log(id)
		for (let i = 0; i < questLinesList.length; i++) {
			if (questLinesList[i].id === id) {
				return questLinesList[i].name
			}
		}

		return "NaN"
	}

	const handleSubmit = async (e) => {
		setPhoto("some_photo")

		e.preventDefault()

		console.log(questOptions)

		// try {
		// 	const response = await axiosPrivate.post(`/quest/lines/create/${url}`, JSON.stringify({"name": name, "unique_number": uniqueNum, "description": description, "photo": photo, "quest_options": questOptions}))

		// 	window.location.reload(false);
		// } catch (err) {
		// 	if (!err?.response) {
		// 		setErrMsg("No server respone")
		// 	} else if (err.response?.status === 400) {
		// 		redirectLogin()
		// 	} else if (err.response?.status === 403) {
		// 		setErrMsg("Quest line with this unique number already exists")
		// 	} else {
  //               setErrMsg("Create Quest Line Failed")
  //           }
  //           handleShowErr(true)
		// }
			
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
				    	<Stack direction="row" spacing={2} className="mb-2">
				    		<Typography variant="h6">Option #{i+1}</Typography>
			    			<Button variant="contained" color="error" size="small" onClick={() => removeOptionField(i)}>Delete</Button>
					    </Stack>
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

export default EditQuestLineForm