import { useState, useEffect } from "react"
import axios from "../../api/axios"

const QuestsList = () => {
    const [quests, setQuests] = useState("")

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuests = async () => {
            
            try {
                const response = await axios.get("/quest/all", {
                    signal: controller.signal
                })
                isMounted && setQuests(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getQuests()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    return (
        <>
            {quests?.length
                ? (
                    <ul>
                        {quests.map((quest, i) => 
                            <li key={i}>{quest.name}</li> 
                        )}
                    </ul>
                ) : null
            }
        </>
    )
}

export default QuestsList