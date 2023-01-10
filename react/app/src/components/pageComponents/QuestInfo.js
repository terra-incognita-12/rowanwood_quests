import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import moment from 'moment'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import CommentForm from "../forms/CommentForm"
import useAuth from "../../hooks/useAuth"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const QuestInfo = ({ url }) => {
	const [quest, setQuest] = useState("")
	const [commentChanged, setCommentChanged] = useState(false)
	const { auth } = useAuth()
	const axiosPrivate = useAxiosPrivate()  
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

	const handleCommentChanged = () => setCommentChanged(true)
 
	const handleCommentDelete = async (id) => {
		try {
			await axiosPrivate.post("/comment/delete", JSON.stringify({id}))

		} catch (err) {
			redirectLogin()
		}
	}

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuest = async () => {
            
            try {
                const response = await axios.get(`/quest/${url}`, {
                    signal: controller.signal
                })
                isMounted && setQuest(response.data)
                commentChanged && setCommentChanged(false)
            } catch (err) {
                console.log(err)
            } 
        }

        getQuest()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [commentChanged])

	return (
		<div className="mt-3">
            <Button component={Link} to="/" variant="text" size="large">&lt;&lt; Back</Button>
            <Card className="mt-3">
                <CardContent>
                    <Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">{quest.name}</Typography>
                    <Typography gutterBottom variant="h6">Telegram address: <i>@{quest.telegram_url}</i></Typography>
                    <hr/>
                    <Typography gutterBottom variant="body1">{quest.full_description}</Typography>
                    <Button component={Link} to={`/library?tag=${quest.url}`} variant="text">#{quest.url} </Button>
                    <hr/>
                    {quest.quest_comments?.length
						?
						quest.quest_comments.map((comment, i) =>
							<Row key={i} className="mb-3">
								<Col xs={12} md={8}>
									<Paper elevation={3}>
										<div className="d-flex justify-content-between">
											<Stack direction="row" spacing={2}>
												<div>
													<Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
												</div>
												<div>
													<Typography variant="h5">{comment.user.username}</Typography>
													<Typography gutterBottom variant="body2" color="text.secondary">{moment(new Date(comment.created_at)).format('MM/DD/YY HH:mm:ss')}</Typography>
												</div>
											</Stack>
											{auth?.role === 'admin'
												?
												<div>
													<Button variant="contained" color="error" size="small" onClick={() => handleCommentDelete(comment.id)}>Delete Comment</Button>
												</div>
												: null
											}
										</div>
										<Typography variant="body1">{comment.text_comment}</Typography>
		                            </Paper>
								</Col>
							</Row>
						) : <Typography gutterBottom variant="body1">No comments yet, be first!</Typography>
					}
					<Row className="mt-3">
			 			<Col xs={12} md={8}>
			 				{auth?.user
								? <CommentForm url={url} handleCommentChanged={handleCommentChanged} />
								: <Typography variant="h6">Sign in to leave comments!</Typography>
							}
						</Col>
					</Row>
                </CardContent>
            </Card>
        </div>
		// <>
		// 	<div className="text-center mt-5">
		// 		<h1>{quest?.name}</h1>
		// 	</div>
		// 	<div className="">
		// 		<h4><i>Telegram link:</i> <b>@{quest?.url}</b></h4> 
		// 	</div>
		// 	<div className="mt-3">
		// 		<p>{quest?.full_description}</p>
		// 	</div>
		// 	<Link to="/" className="text-decoration-none">#{quest?.url}</Link>
		// 	<hr/>
		// 	<div className="mt-3">
		// 		{quest?.quest_comments?.length
		// 			?
		// 			quest.quest_comments.map((comment, i) =>
		// 				<Row key={i}>
		// 					<Col xs={12} md={8}>
		// 						<Card>
		// 							<Card.Header className="d-flex justify-content-between">
		// 								<div>
		// 									<Card.Title>{comment.user.username}</Card.Title>
		// 									<Card.Subtitle className="text-muted">{moment(new Date(comment.created_at)).format('MM/DD/YY HH:mm:ss')}</Card.Subtitle>
		// 								</div>
		// 								<div>
		// 									{auth?.role === 'admin'
		// 										?
		// 										<Button variant="danger" size="sm" onClick={() => handleCommentDelete(comment.id)}>Delete</Button>
		// 										: null
		// 									}
		// 								</div>
		// 							</Card.Header>
		// 							<p>{comment.text_comment}</p>
		// 						</Card>	
		// 					</Col>
		// 				</Row>
		// 			) : <p>No comments yet!</p>
		// 		}
		// 		<Row className="mt-3">
		// 			<Col xs={12} md={8}>
		// 				{auth?.user
		// 					? <CommentForm url={url} handleCommentChanged={handleCommentChanged} />
		// 					: <h4>Sign in to leave comments</h4>
		// 				}
		// 			</Col>
		// 		</Row>
		// 	</div>
		// </>
	)
}

export default QuestInfo