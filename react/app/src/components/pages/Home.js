import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { CardActionArea } from '@mui/material';
import Box from '@mui/material/Box';

import axios from "../../api/axios"
import HeadQuote from "../HeadQuote"

const Home = () => {
	const [quests, setQuests] = useState([])

    useEffect(() => {

        let isMounted = true
        const controller = new AbortController()

        const getQuests = async () => {
            
            try {
                const response = await axios.get("/quest/all/preview", {
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
		<div className="mt-3">
      <HeadQuote quote="VINCIT QUI PATITUR" translation="He conquers who endures" />
			<Row>
	            {quests.length
	                ?
	                quests.map((quest, i) =>
                        <Col xs={12} md={4} key={i} className="quest-col">
                            <Card className="mt-3" sx={{ borderRadius: '20px'}} >
                                <CardActionArea component={Link} to={`quest/${quest.url}`}
                                    sx={{
                                            height: "100%",
                                            "&:hover": {
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
                                        <Typography variant="body2" component="div" sx={{ height: 100, position: 'relative', overflow: 'auto', maxHeight: 100}}>{quest.brief_description}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Col>
	                ) : null
	            }
	        </Row>
		</div>
	)
}

export default Home