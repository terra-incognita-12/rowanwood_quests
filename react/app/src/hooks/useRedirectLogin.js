import { useNavigate } from "react-router-dom"

import useAuth from "./useAuth"

const useRedirectLogin = (location) => {
	const { setAuth } = useAuth()
	const navigate = useNavigate()

	const redirectLogin = () => {
		setAuth({})
		navigate('/login', { state: { from: location }, replace: true })
	}

	return redirectLogin
}

export default useRedirectLogin