import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

import EditLibraryTagForm from "../../../forms/EditLibraryTagForm"

const EditLibraryTagsList = () => {
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const [dropDownTags, setDropDownTags] = useState([])
    const [allTags, setAllTags] = useState([])
    const [pickedTag, setPickedTag] = useState("")
    const [dbTag, setDbTag] = useState("")
    const [showForm, setShowForm] = useState(false)

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
    			if (isMounted) {
                    setDropDownTags(data)
                    setAllTags(response.data)
                }
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

    const getTag = () => {
        const record = allTags.find(elem => elem.name === pickedTag.name)
        setDbTag(record)
        setShowForm(true)
    }

	return (
		<div className="mt-3">
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>

            <Row className="mt-3">
                <Col xs={12} md={6}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={dropDownTags}
                        onChange={(e, newValue) => {
                            setPickedTag(newValue)
                        }}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => <TextField fullWidth {...params} label="Tags" />}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Button variant="contained" color="primary" size="large" onClick={getTag}>Search</Button>
                </Col>
            </Row>
            
            {showForm
                ? <EditLibraryTagForm tag={dbTag} /> 
                : null
            }
		</div>
	)
}

export default EditLibraryTagsList