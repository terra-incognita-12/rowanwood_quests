import { useState, useEffect, forwardRef } from "react"
import { Link } from "react-router-dom"
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
// import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';


import CreateQuestLineForm from "../../../forms/CreateQuestLineForm"
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
      		<Button component={Link} to={`/`} size="small">{params.row.name}</Button>, 
	},
];

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const QuestLinesList = () => {

	const { url } = useParams()
	const axiosPrivate = useAxiosPrivate()

	const [rows, setRows] = useState([])
	const [newLineModalOpen, setNewLineModalOpen] = useState(false)

	const handleNewLineModalOpen = () => {
		setNewLineModalOpen(true)
	}

	const handleNewLineModalClose = () => {
		setNewLineModalOpen(false)
	}
	
	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getLines = async () => {
            try {
                const response = await axiosPrivate.get(`/quest/lines/all/${url}`, {
                    signal: controller.signal
                })

                let data = []
                for (let i = 0; i < response.data.length; i++) {
                    let data_dict = {"id": response.data[i].unique_number, "name": response.data[i].name}
                    data.push(data_dict)
                }
                if (isMounted) {
                    setRows(data)
                }
            } catch (err) {
                console.log(err)
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
	            <CardContent style={{ height: 500, width: '100%' }}>
	                <Typography gutterBottom variant="h3" component="div">Quest Lines</Typography>
	                <Button variant="contained" color="primary" onClick={handleNewLineModalOpen}>Create New Line</Button>
	                <DataGrid
	                	className="mt-2"
				        rows={rows}
				        columns={columns}
				    />
	            </CardContent>
	        </Card>

	        <Dialog
		        fullScreen
		        open={newLineModalOpen}
		        onClose={handleNewLineModalClose}
		        TransitionComponent={Transition}
		    >
		        <AppBar sx={{ position: 'relative' }}>
		        	<Toolbar>
			            <IconButton
			            	edge="start"
			            	color="inherit"
			            	onClick={handleNewLineModalClose}
			            	aria-label="close"
			            >
			            	X
			            </IconButton>
			            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
			            	Create New Line	
			            </Typography>
			            <Button autoFocus color="inherit" onClick={handleNewLineModalClose}>
			             	Save
			            </Button>
		          	</Toolbar>
		        </AppBar>
		        <CreateQuestLineForm />
      		</Dialog>
       	</div>
	)
}

export default QuestLinesList