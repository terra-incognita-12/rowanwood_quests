import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { Link } from "react-router-dom"

import axios from "../../../api/axios"
import EditQuestForm from "../../forms/EditQuestForm"

const EditQuest = () => {
	const { url } = useParams()
    const [quest, setQuest] = useState("")

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuest = async () => {
            
            try {
                const response = await axios.get(`/quest/${url}`, {
                    signal: controller.signal
                })
                isMounted && setQuest(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getQuest()
        
        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

	return (
        <>  <div className="d-flex justify-content-between">
                <Link to="/editor/quest/edit" className="btn btn-primary mt-3">Back to Quest List</Link>
                <Link to={`/editor/quest/delete/${url}`} className="btn btn-danger mt-3">Delete Quest</Link>
            </div>
		    <EditQuestForm quest={quest} />
        </>
	)
}

export default EditQuest 