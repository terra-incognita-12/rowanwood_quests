import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Link } from "react-router-dom"

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

import EditLibraryRecordForm from "../../../forms/EditLibraryRecordForm"

const EditLibraryRecordsList = () => {
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const [records, setRecords] = useState([])
    const [record, setRecord] = useState("")
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
                	let data_dict = {"name": response.data[i].name}
                	data.push(data_dict)
                }
    			isMounted && setRecords(data)
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

    const getRecord = async () => {
        let isMounted = true
        const controller = new AbortController()

        try {
            const response = await axiosPrivate.get(`/library/records/${record}`, {
                signal: controller.signal
            })
            isMounted && setRecord(response.data)
        } catch (err) {
            console.log(err)
        }

        setShowForm(true)

        return () => {
            isMounted = false
            controller.abort()
        }
    }

	return (
		<div className="mt-3">
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>

            <Row className="mt-3">
                <Col xs={12} md={6}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={records}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => <TextField fullWidth {...params} label="Records" />}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Button variant="contained" color="primary" size="large" onClick={getRecord}>Search</Button>
                </Col>
            </Row>
            
            {showForm 
                ? <EditLibraryRecordForm /> 
                : null
            }
		</div>
	)
}

export default EditLibraryRecordsList