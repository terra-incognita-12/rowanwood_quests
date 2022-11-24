import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"

import useAuth from "../../hooks/useAuth"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const Admin = () => {
	const [user, setUser] = useState()

    const axiosPrivate = useAxiosPrivate()  
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

    // Prevent dobule run react strict mode
    const oneTimeRun = useRef(false)

    useEffect(() => {
    	let isMounted = true
    	const controller = new AbortController()

    	const getUsers = async () => {
    		try {
    			const response = await axiosPrivate.get("/user/me", {
    				signal: controller.signal
    			})
    			isMounted && setUser(response.data)
    		} catch (err) {
    			redirectLogin()
    		}
    	}

    	if (oneTimeRun.current) {
    		getUsers()
    	}

    	return () => {
    		isMounted = false
    		controller.abort()
    		oneTimeRun.current = true
    	}
    }, [])

	return (
		<>
            <h2>Admin info</h2>
            {user
            	?
	            <ul>
	                <li>{user.username}</li>
	                <li>{user.role}</li>
	            </ul>
	            : <p>No info</p>
            }
        </>
	)
}

export default Admin