import { useEffect } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

const DeleteLibraryRecord = () => {
	const { url } = useParams()
	const navigate = useNavigate()
	const axiosPrivate = useAxiosPrivate()  

    const deleteLR = async () => {
    	try {
			const response = await axiosPrivate.delete(`/library/records/delete/${url}`, JSON.stringify({"url": url}))
			navigate("/editor/library/edit", { replace: true })
		} catch (err) {
            console.log(err)
		}
    }

	useEffect(() => {
		deleteLR()
	}, [])
}

export default DeleteLibraryRecord