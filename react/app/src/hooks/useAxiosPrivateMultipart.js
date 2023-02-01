import { useEffect } from "react"

import { axiosPrivateMultipart } from "../api/axios"
import useRefreshToken from "./useRefreshToken"
import useAuth from "./useAuth"

const useAxiosPrivateMultipart = () => {
	const refresh = useRefreshToken()
	const { auth } = useAuth()

	useEffect(() => {
		const requestInterceptor = axiosPrivateMultipart.interceptors.request.use(
			config => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${auth?.accessToken}`
				}
				return config
			}, (error) => Promise.reject(error)
		)

		const responseInterceptor = axiosPrivateMultipart.interceptors.response.use(
			response => response,
			async (error) => {
				const previousRequest = error?.config
				if (error?.response?.status === 401 && !previousRequest?.isSent) {
					const newAccessToken = await refresh()
					return axiosPrivateMultipart({
						...previousRequest,
						headers: {...previousRequest.headers, Authorization: `Bearer ${newAccessToken}`},
						isSent: true
					})
				}
				return Promise.reject(error)
			}
		)

		return () => {
			axiosPrivateMultipart.interceptors.request.eject(requestInterceptor)
			axiosPrivateMultipart.interceptors.response.eject(responseInterceptor)
		}
	}, [auth, refresh])

	return axiosPrivateMultipart
}

export default useAxiosPrivateMultipart
