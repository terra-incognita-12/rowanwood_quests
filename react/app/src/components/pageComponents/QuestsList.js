import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
// import Button from "react-bootstrap/Button"
// import Card from "react-bootstrap/Card"

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { CardActionArea } from '@mui/material';

import axios from "../../api/axios"

const QuestsList = () => {
    const [quests, setQuests] = useState("")

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuests = async () => {
            
            try {
                const response = await axios.get("/quest/all/comments", {
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
                    <Col xs={12} md={4} className="mt-3" key={i}>
                        <Card className="mt-3">
                            <CardActionArea component={Link} to={`quest/${quest.url}`} 
                                sx={{ "&:hover": {
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        cursor: "pointer"
                                    } 
                                }}
                            >
                            
                                <CardMedia
                                    sx={{ height: 250 }}
                                    image={quest.photo}
                                    title={quest.name}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h4" component="div">{quest.name}</Typography>
                                    <Typography variant="body1" component="div" sx={{ height: 50, position: 'relative', overflow: 'auto', maxHeight: 50}}>{quest.brief_description}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Col>
                ) : null
            }
        </Row>
    )
}

export default QuestsList