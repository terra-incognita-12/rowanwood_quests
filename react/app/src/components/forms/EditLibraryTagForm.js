import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Link } from "react-router-dom"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const EditLibraryTagForm = ({ tag }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const redirectLogin = useRedirectLogin(location)

	const tagId = tag?.id
	const tagName = tag?.name
	const tagRecords = tag?.library_records

	const [name, setName] = useState("")
	const [records, setRecords] = useState([])

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(tagName)
		setRecords(tagRecords)
	}, [tagName, tagRecords])

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			const response = await axiosPrivate.patch(`/library/tags/update/${tagId}`, JSON.stringify({"name": name}))
			alert("Tag updated successfuly")
			window.location.reload(false);
		} catch (err) {
			if (!err?.response) {
					setErrMsg("No server respone")
			} else if (err?.response?.status === 400) {
					redirectLogin()
			} else if (err?.response?.status) {
					setErrMsg(err?.response?.data?.detail)
			} else {
					setErrMsg("Update Tag Failed")
			}
			handleShowErr(true)
			window.scrollTo(0, 0);
			return
		}
	}

	const handleDelete = async () => {
		const answer = window.confirm("Are you sure to delete this tag?")
		if (!answer) { return }

		try {
				await axiosPrivate.delete(`/library/tags/delete/${tagId}`)
				window.location.reload(false);
		} catch (err) {
				if (!err?.response) {
						setErrMsg("No server respone")
				} else if (err?.response?.status === 400) {
						redirectLogin()
				} else if (err?.response?.status) {
						setErrMsg(err?.response?.data?.detail)
				} else {
						setErrMsg("Delete Tag Failed")
				}
				handleShowErr(true)
				window.scrollTo(0, 0);
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
				<Row>
					<Col xs={12} lg={6} className="mb-2">
						<Typography gutterBottom variant="h3" component="div">{tagName}</Typography>
						<Button variant="contained" color="error" onClick={handleDelete}>Delete Tag</Button>
						<Form onSubmit={handleSubmit} className="mt-3">
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
							<div className="mt-3">
								<Button variant="contained" color="success" type="submit">Update Tag</Button>
							</div>
						</Form>
					</Col>
					<Col xs={12} lg={6}>
						<Typography gutterBottom variant="h5" component="div">Tag used in:</Typography>
						<Paper elevation={3}>
							<List sx={{ height: 200, position: 'relative', overflow: 'auto', maxHeight: 200}}>
								{records.map((record, i) =>
									<ListItem key={i} component="div">
											<ListItemText primary={`${record.name}`} />
									</ListItem>
								)}
							</List>
						</Paper>
					</Col>
				</Row>
			</CardContent>
		</Card>
		</>
	)
}

export default EditLibraryTagForm