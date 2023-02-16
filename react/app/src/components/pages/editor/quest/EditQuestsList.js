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
import axios from "../../../../api/axios"
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

import EditQuestForm from "../../../forms/EditQuestForm"

const EditQuestList = () => {
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const redirectLogin = useRedirectLogin(location)

	const [dropDownQuests, setDropDownQuests] = useState([])
	// quest picked from dropdown
	const [pickedQuest, setPickedQuest] = useState("")
	// quest pulled from db
	const [dbQuest, setDbQuest] = useState("")

	const [showForm, setShowForm] = useState(false)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const getQuests = async () => {
			try {
				const response = await axios.get("/quest/all/dropdown", {
					signal: controller.signal
				})
				isMounted && setDropDownQuests(response.data)
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

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const getQuest = async () => {
		try {
			const response = await axios.get(`/quest/${pickedQuest.url}`)
			setDbQuest(response.data)
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Edit Quest Failed")
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
							options={dropDownQuests}
							onChange={(e, newValue) => {
									setPickedQuest(newValue)
							}}
							getOptionLabel={(option) => option.name}
							renderInput={(params) => <TextField fullWidth {...params} label="Quests" />}
						/>
						<Button variant="contained" color="primary" size="large" onClick={getQuest}>Search</Button>
					</Stack>
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