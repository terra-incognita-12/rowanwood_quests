import { useState, useEffect } from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"
import ListGroup from "react-bootstrap/ListGroup"

import axios from "../../../api/axios"

const EditQuest = () => {
	const [quests, setQuests] = useState("")
	const [showQuests, setShowQuests] = useState(true)

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
		<Row className="mt-5 justify-content-center">
			<Col xs={12} md={6}>
				{quests?.length
                	?
                	quests.map((quest, i) =>
                		<ListGroup key={i}>
                			<ListGroup.Item action>{quest.name}</ListGroup.Item>
                		</ListGroup>
                	) : null
                }	
			</Col>
		</Row>
	)
}

export default EditQuest