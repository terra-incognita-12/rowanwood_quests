import { useEffect } from "react"

import { axiosPrivate } from "../api/axios"
import useRefreshToken from "./useRefreshToken"
import useAuth from "./useAuth"

import Cookies from "js-cookie"

const useAxiosPrivate = () => {
	const refresh = useRefreshToken()
	const { auth } = useAuth()

	useEffect(() => {
		let token = auth?.accessToken
		const isLogged = Cookies.get("logged_in")
		if (!isLogged) {
			token = 0
		}

		const requestInterceptor = axiosPrivate.interceptors.request.use(
			config => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${token}`
				}
				return config
			}, (error) => Promise.reject(error)
		)

		const responseInterceptor = axiosPrivate.interceptors.response.use(
			response => response,
			async (error) => {
				const previousRequest = error?.config
				if (error?.response?.status === 401 && !previousRequest?.isSent) {
					const newAccessToken = await refresh()
					return axiosPrivate({
						...previousRequest,
						headers: {...previousRequest.headers, Authorization: `Bearer ${newAccessToken}`},
						isSent: true
					})
				}
				return Promise.reject(error)
			}
		)

		return () => {
			axiosPrivate.interceptors.request.eject(requestInterceptor)
			axiosPrivate.interceptors.response.eject(responseInterceptor)
		}
	}, [auth, refresh])

	return axiosPrivate
}

export default useAxiosPrivate
