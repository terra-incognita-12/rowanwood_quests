import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"

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
        <Row>
            {quests?.length
                ?
                quests.map((quest, i) => 
                    <Col xs={12} md="auto" className="mt-3" key={i}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{quest.name}</Card.Title>
                                <Card.Text>{quest.brief_description}</Card.Text>
                                <Link to={`quest/${quest.url}`} className="btn btn-primary">Quest info</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : null
            }
        </Row>
    )
}

export default QuestsList