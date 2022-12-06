import { useEffect } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

const DeleteQuest = () => {
	const { url } = useParams()
	const navigate = useNavigate()
	const axiosPrivate = useAxiosPrivate()  

    const deleteQ = async () => {
    	try {
			const response = await axiosPrivate.delete(`/quest/delete/${url}`, JSON.stringify({"url": url}))
			navigate("/editor/quest/edit", { replace: true })
		} catch (err) {
            console.log(err)
		}
    }

	useEffect(() => {
		deleteQ()
	}, [])
}

export default DeleteQuest