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

import EditQuestForm from "../../../forms/EditQuestForm"

const EditQuestList = () => {
    const location = useLocation()
    const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const [dropDownQuests, setDropDownQuests] = useState([])
    const [allQuests, setAllQuests] = useState([])
    const [pickedQuest, setPickedQuest] = useState("")
    const [dbQuest, setDbQuest] = useState("")
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuests = async () => {
            try {
                const response = await axiosPrivate.get("/quest/all/lines", {
                    signal: controller.signal
                })
                
                let data = []
                for (let i = 0; i < response.data.length; i++) {
                    let data_dict = {"name": response.data[i].name, "url": response.data[i].url}
                    data.push(data_dict)
                }
                if (isMounted) {
                    setDropDownQuests(data)
                    setAllQuests(response.data)
                }
            } catch (err) {
                console.log(err)
            } 
        }

        getQuests()

        return () => {
            isMounted = false
            controller.abort()
        }

    }, [])

    const getQuest = () => {
        const quest = allQuests.find(elem => elem.url === pickedQuest.url)
        setDbQuest(quest)
        setShowForm(true)
    }

	return (
        <div className="mt-3">
            <Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>
            <Row className="mt-3">
                <Col xs={12} md={6}>
                    <Autocomplete
                        disablePortal
                        options={dropDownQuests}
                        onChange={(e, newValue) => {
                            setPickedQuest(newValue)
                        }}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => <TextField fullWidth {...params} label="Quests" />}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Button variant="contained" color="primary" size="large" onClick={getQuest}>Search</Button>
                </Col>
            </Row>
            
            {showForm
                ? <EditQuestForm quest={dbQuest} /> 
                : null
            }
        </div>
	)
}

export default EditQuestList