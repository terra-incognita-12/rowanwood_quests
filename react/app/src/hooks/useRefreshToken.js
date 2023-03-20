import axios from "../api/axios"
import useAuth from "./useAuth"

const useRefreshToken = () => {
	const { setAuth } = useAuth()

	const refresh = async() => {
		const response = await axios.get("/auth/refresh", {
			withCredentials: true
		})
		setAuth(previous => {
      return {
      	...previous,
      	id: response.data.id,
      	username: response.data.username,
      	user: response.data.email,
      	role: response.data.role,
      	accessToken: response.data.access_token,
      	photo: response.data.photo
      }
		})

		return response.data.access_token
	}

	return refresh
}

export default useRefreshToken