import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"

import useAuth from "../../hooks/useAuth"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Slide from '@mui/material/Slide';

const Admin = () => {
	const [rows, setRows] = useState([])

    const axiosPrivate = useAxiosPrivate()  
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

    const columns = [
		{ field: 'username', headerName: 'Username', flex: 0.7 },
		{ field: 'email', headerName: 'Email', flex: 0.7 },
		{ field: 'role', headerName: 'Role', flex: 0.7 },
		{ 	
			field: 'changeRole',
			flex: 0.5,
			headerName: 'Change Role',
			renderCell: (params) => 
	      		<Button onClick={() => handleChangeUserRole(params.row.username, params.row.role)} size="small">
	      			{params.row.role === "editor"
	      				? "Make User"
	      				: "Make Editor"
	      			}
	      		</Button>, 
		},
		{ 	
			field: 'deleteUser',
			flex: 0.3,
			headerName: 'Delete User',
			renderCell: (params) => 
	      		<IconButton onClick={() => handleDeleteUser(params.row.username)} size="small" color="error"><HighlightOffIcon/></IconButton>,
		},
	];

    const handleChangeUserRole = async (username, role) => {
    	let toRole = 'user'
    	if (role === 'user') { toRole = 'editor'}
    	const answer = window.confirm(`Are you sure you want to change ${username} role from ${role} to ${toRole}?`)
        if (!answer) { return }

        try {
			await axiosPrivate.patch(`/user/change_role/${username}`)
            window.location.reload(false);
		} catch (err) {
			if (err?.response?.status === 400) {
				redirectLogin()
			} else {
				console.log(err)
			}
		}	

    }

    const handleDeleteUser = async (username) => {
    	const answer = window.confirm(`Are you sure you want to delete user ${username}?`)
        if (!answer) { return }

        try {
			const response = await axiosPrivate.delete(`/user/delete/${username}`)
            window.location.reload(false);
		} catch (err) {
			if (err.response?.status === 400) {
				redirectLogin()
			} else {
				console.log(err)
			}
		}	

    }

    useEffect(() => {
    	let isMounted = true
    	const controller = new AbortController()

    	const getUsers = async () => {
    		try {
    			const response = await axiosPrivate.get("/user/all", {
    				signal: controller.signal
    			})
    			isMounted && setRows(response.data)
    		} catch (err) {
    			if (err?.response?.status === 400) {
					redirectLogin()
				} else {
    				console.log(err)
				}
    		}
    	}

    	getUsers()

    	return () => {
    		isMounted = false
    		controller.abort()
    	}
    }, [])

	return (
		<div className="mt-3">
			<Card className="mt-3">
	            <CardContent sx={{ height: 'auto', overflow: "auto" }}>
	                <Typography gutterBottom variant="h3" component="div">Users</Typography>
	                <DataGrid
	                	disableSelectionOnClick
	                	className="mt-2"
				        rows={rows}
				        columns={columns}
				        autoHeight={true}
				    />
	            </CardContent>
	        </Card>
	    </div>
	)
}

export default Admin