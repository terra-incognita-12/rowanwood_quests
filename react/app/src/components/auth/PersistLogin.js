import { Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

import useRefreshToken from "../../hooks/useRefreshToken"
import useAuth from "../../hooks/useAuth"
import useRedirectLogin from "../../hooks/useRedirectLogin"
import LoadingBackdrop from "../Backdrop"

const PersistLogin = () => {
	const [isLoading, setIsLoading] = useState(true)
	const refresh = useRefreshToken()
	const location = useLocation()
	const redirectLogin = useRedirectLogin(location)
	const { auth } = useAuth()

	useEffect(() => {
		const verifyRefreshToken = async () => {
			try {
				await refresh()
			} catch (err) {
				console.log(err)
			} finally {
				setIsLoading(false)
			}
		}

		!auth?.accessToken ? verifyRefreshToken() : setIsLoading(false) 
	}, [])

	return (
		<>
			{isLoading
				? <LoadingBackdrop open={isLoading} /> 
				: <Outlet />
			}
		</>
	)
}

export default PersistLogin