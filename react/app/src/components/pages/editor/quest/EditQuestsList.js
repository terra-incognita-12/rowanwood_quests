import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"
import ListGroup from "react-bootstrap/ListGroup"

import axios from "../../../../api/axios"

const EditQuestList = () => {
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
        <>
            <Link to="/editor" className="btn btn-primary mt-3">Back to Editor Menu</Link>
            <Row className="justify-content-center mt-5">
                <Col xs={12} md={8}>
                    {quests?.length
                        ?
                        quests.map((quest, i) =>
                            <ListGroup key={i}>
                                <Link to={`${quest.url}`} className="list-group-item list-group-item-action text-center">{quest.name}</Link>
                            </ListGroup>
                        ) : null
                    }   
                </Col>
            </Row>
        </>
	)
}

export default EditQuestList