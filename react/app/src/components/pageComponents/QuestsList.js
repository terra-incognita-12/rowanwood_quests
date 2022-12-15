import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
// import Button from "react-bootstrap/Button"
// import Card from "react-bootstrap/Card"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

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
            {quests.length
                ?
                quests.map((quest, i) => 
                    <Col xs={12} md={3} className="mt-3" key={i}>
                        <Card className="mt-3">
                            <CardContent>
                                <Typography gutterBottom variant="h4" component="div">{quest.name}</Typography>
                                <Typography variant="body1" component="div">{quest.brief_description}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={Link} to={`quest/${quest.url}`}>Jump in</Button>
                            </CardActions>
                        </Card>
                    </Col>
                ) : null
            }
        </Row>
    )
}

export default QuestsList