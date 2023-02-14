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
import Stack from '@mui/material/Stack';

import ErrMsg from "../../../ErrMsg"
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import axios from "../../../../api/axios"
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

    const [errMsg, setErrMsg] = useState("")
    const [showErrMsg, setShowErrMsg] = useState(false)

    useEffect(() => {
		let isMounted = true
        const controller = new AbortController()

        const getTags = async () => {
            try {
                const response = await axios.get("/library/tags/all", {
                    signal: controller.signal
                })
                
                isMounted && setDropDownTags(response.data)
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

    const getTag = async () => {
        try {
            const response = await axios.get(`/library/tags/${pickedTag.id}`)
            setDbTag(response.data)
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No server respone")
            } else if (err?.response?.status === 400) {
                redirectLogin()
            } else if (err?.response?.status) {
                setErrMsg(err?.response?.data?.detail)
            } else {
                setErrMsg("Edit Tag Failed")
            }
            handleShowErr(true)
            return
        }
        setShowForm(true)
    }

	return (
		<div className="mt-3">
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>

            <Row className="mt-3">
                <Col xs={12} md={6}>
                    {showErrMsg
                        ?
                        <ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
                        : null
                    }
                    <Stack spacing={2} direction="row">
                        <Autocomplete
                            fullWidth
                            disablePortal
                            id="combo-box-demo"
                            options={dropDownTags}
                            onChange={(e, newValue) => {
                                setPickedTag(newValue)
                            }}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => <TextField fullWidth {...params} label="Tags" />}
                        />
                        <Button variant="contained" color="primary" size="large" onClick={getTag}>Search</Button>
                    </Stack>
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