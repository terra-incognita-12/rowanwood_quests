import { useState, useEffect, forwardRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useParams } from "react-router"

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

import CreateQuestLineForm from "../../../forms/CreateQuestLineForm"
import axios from "../../../../api/axios"
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

const columns = [
	{ field: 'id', headerName: 'ID', width: 70 },
	{
		field: 'name',
		headerName: 'Name',
		minWidth: 130,
		flex: 1,
		renderCell: (params) =>
					<Button component={Link} to={`${params.row.id}`} size="small">{params.row.name}</Button>,
	},
];

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const QuestLinesList = () => {
	const { url } = useParams()
	const navigate = useNavigate()

	const axiosPrivate = useAxiosPrivate()

	const [rows, setRows] = useState([])
	const [questsLinesList, setQuestsLinesList] = useState([])
	
	const [lineModalOpen, setLineModalOpen] = useState(false)

	const handleLineModalOpen = () => {
		setLineModalOpen(true)
	}

	const handleLineModalClose = () => {
		setLineModalOpen(false)
	}
	
	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const getLines = async () => {
			try {
				const response = await axios.get(`/quest/lines/all/${url}`, {
						signal: controller.signal
				})
				let dataRows = []
				let dataQuestLines = []
				for (const line of response.data) {
						dataRows.push({"id": line.unique_number, "name": line.name})
						dataQuestLines.push({"id": line.id, "name": line.name})
				}
				if (isMounted) {
					setRows(dataRows)
					setQuestsLinesList(dataQuestLines)
				}
			} catch (err) {
			 if (err?.response?.status === 404) {
						navigate(`/notexist?err=${err?.response?.data?.detail}`)
				} else {
						console.log(err)
				}
			}
		}

		getLines()

		return () => {
				isMounted = false
				controller.abort()
		}

	}, [])

	return (
		<div className="mt-3">
			<Button component={Link} to="/editor/quest/edit" variant="text" size="large">&lt;&lt; Back</Button>
			<Card className="mt-3">
				<CardContent sx={{ height: 'auto', overflow: "auto" }}>
					<Typography gutterBottom variant="h3" component="div">Quest Lines</Typography>
					<Button variant="contained" color="primary" onClick={handleLineModalOpen}>Create New Line</Button>
					<DataGrid
						disableSelectionOnClick
						className="mt-2"
						rows={rows}
						columns={columns}
						autoHeight={true}
					/>
				</CardContent>
			</Card>

			<Dialog
				fullScreen
				open={lineModalOpen}
				onClose={handleLineModalClose}
				TransitionComponent={Transition}
				disableScrollLock
			>
			<AppBar sx={{ position: 'relative' }}>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						onClick={handleLineModalClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Create New Line
					</Typography>
				</Toolbar>
			</AppBar>
			<CreateQuestLineForm handleLineModalClose={handleLineModalClose} questLinesList={questsLinesList} url={url}/>
		</Dialog>
 	</div>
	)
}

export default QuestLinesList