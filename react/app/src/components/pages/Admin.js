import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const Admin = () => {
	const [rowsUsers, setRowsUsers] = useState([])
	const [rowsRequests, setRowsRequests] = useState([])

	const axiosPrivate = useAxiosPrivate()
	const location = useLocation()
	const redirectLogin = useRedirectLogin(location)

	const columnsUsers = [
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
				</Button>
		},
		{
			field: 'deleteUser',
			flex: 0.3,
			headerName: 'Delete User',
			renderCell: (params) =>
				<IconButton onClick={() => handleDeleteUser(params.row.username)} size="small" color="error"><HighlightOffIcon/></IconButton>
		},
	]


	function getFullName(params) {
		return `${params.row.user_requested.username}`
	}

	const columnsRequests = [
		{ field: 'quest',
			headerName: 'Quest',
			flex: 0.7,
			valueGetter: params => {
				return `${params.row.quest_requested.name}`
			}
		},
		{ field: 'requested_by',
			headerName: 'Requested by',
			flex: 0.7,
			valueGetter: params => {
				return `${params.row.user_requested.username}`
			}
		},
		{ field: 'status',
			headerName: 'Current Status',
			flex: 0.7,
			valueGetter: params => {
				if (params.row.quest_requested.is_activated) {
					return 'Activated'
				}
				return 'Deactivated'
			}
		},
		{ field: 'desicion',
			headerName: 'Desicion',
			flex: 0.3,
			renderCell: (params) =>
				<>
					<Button size="small" color="success" onClick={() => handleActivation(params.row.id, params.row.quest_requested.id, true)}>Yes</Button>
					<Button size="small" color="error" onClick={() => handleActivation(params.row.id, params.row.quest_requested.id, false)}>No</Button>
				</>
		},
	]

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

	const handleActivation = async(requestId, quest, desicion) => {
	const answer = window.confirm(`Are you sure you want to proceed?`)
	if (!answer) { return }

	if (desicion) {
		try {
			const response = await axiosPrivate.patch(`/quest/update/activate/${quest}`)
		} catch (err) {
			if (err.response?.status === 400) {
				redirectLogin()
			} else {
				console.log(err)
			}
		}
	}
			
	try {
		const response = await axiosPrivate.delete(`/quest/activation/delete/${requestId}`)
	} catch (err) {
			if (err.response?.status === 400) {
				redirectLogin()
			} else {
				console.log(err)
				return
			}
		}
		
		window.location.reload(false)
	}

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const getUsers = async () => {
			try {
				const response = await axiosPrivate.get("/user/all", {
					signal: controller.signal
				})
				isMounted && setRowsUsers(response.data)
			} catch (err) {
				if (err?.response?.status === 400) {
				redirectLogin()
			} else {
					console.log(err)
			}
		}
	}

	const getActivationRequests = async () => {
		try {
			const response = await axiosPrivate.get("/quest/activation/all", {
				signal: controller.signal
			})
			isMounted && setRowsRequests(response.data)
		} catch (err) {
			if (err?.response?.status === 400) {
				redirectLogin()
			} else {
				console.log(err)
			}
		}
	}

	getUsers()
	getActivationRequests()

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
					rows={rowsUsers}
					columns={columnsUsers}
					autoHeight={true}
				/>
				<hr/>
				<Typography gutterBottom variant="h3" component="div">Activation Menu</Typography>
				<DataGrid
					disableSelectionOnClick
					className="mt-2"
					rows={rowsRequests}
					columns={columnsRequests}
					autoHeight={true}
				/>
			</CardContent>
		</Card>
	</div>
	)
}

export default Admin