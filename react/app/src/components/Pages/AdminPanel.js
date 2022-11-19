import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import axios from "../../api/axios"

const AdminPanel = () => {
	const [user, setUser] = useState()
    const axiosPrivate = useAxiosPrivate()
    const navigate = useNavigate()  
    const location = useLocation()

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
    			navigate('/login', { state: { from: location }, replace: true })
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

export default AdminPanel