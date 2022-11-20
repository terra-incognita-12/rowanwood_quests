import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import useLogout from "../../hooks/useLogout"

const Logout = () => {
	const logout = useLogout()

	const doLogout = async () => {
		await logout()
	}

	useEffect(() => {
		doLogout()
	}, [])

	return (
		<Navigate to="/login" replace />
	)
}

export default Logout