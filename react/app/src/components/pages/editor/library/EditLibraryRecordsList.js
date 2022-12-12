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

import EditLibraryRecordForm from "../../../forms/EditLibraryRecordForm"

const EditLibraryRecordsList = () => {
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const [dropDownRecords, setDropDownRecords] = useState([])
    const [allRecords, setAllRecords] = useState([])
    const [pickedRecord, setPickedRecord] = useState("")
    const [dbRecord, setDbRecord] = useState("")
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
		let isMounted = true
        const controller = new AbortController()

        const getRecords = async () => {
            try {
                const response = await axiosPrivate.get("/library/records/all", {
                    signal: controller.signal
                })
                
                let data = []
                for (let i = 0; i < response.data.length; i++) {
                	let data_dict = {"name": response.data[i].name, "url": response.data[i].url}
                	data.push(data_dict)
                }
    			if (isMounted) {
                    setDropDownRecords(data)
                    setAllRecords(response.data)
                }
            } catch (err) {
                console.log(err)
            } 
        }

        getRecords()

        return () => {
            isMounted = false
            controller.abort()
        }

	}, [])

    const getRecord = () => {
        const record = allRecords.find(elem => elem.url === pickedRecord.url)
        setDbRecord(record)
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
                        options={dropDownRecords}
                        onChange={(e, newValue) => {
                            setPickedRecord(newValue)
                        }}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => <TextField fullWidth {...params} label="Records" />}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Button variant="contained" color="primary" size="large" onClick={getRecord}>Search</Button>
                </Col>
            </Row>
            
            {showForm
                ? <EditLibraryRecordForm record={dbRecord} /> 
                : null
            }
		</div>
	)
}

export default EditLibraryRecordsList