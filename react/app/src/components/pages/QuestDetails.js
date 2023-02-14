import { useParams } from "react-router"
import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import CommentForm from "../forms/CommentForm"
import useAuth from "../../hooks/useAuth"
import useRedirectLogin from "../../hooks/useRedirectLogin"
import LoadingBackdrop from "../Backdrop"

const QuestDetails = () => {
	const { url } = useParams()

	const [quest, setQuest] = useState("")
	const [backdropOpen, setBackdropOpen] = useState(false)
	const [commentChanged, setCommentChanged] = useState(false)
	const { auth } = useAuth()
	const navigate = useNavigate()
	const axiosPrivate = useAxiosPrivate()
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

	const handleCommentChanged = () => setCommentChanged(true)
 
	const handleCommentDelete = async (id) => {
		try {
			await axiosPrivate.post("/comment/delete", JSON.stringify({id}))
			handleCommentChanged()
		} catch (err) {
			if (!err?.response) {
				console.log("No server respone")
			} else if (err?.response?.status === 400) {
				redirectLogin()
			} else if (err?.response?.status) {
				console.log(err?.response?.data?.detail)
			} else {
                console.log("Delete comment failed")
            }
		}
	}

	useEffect(() => {
		setBackdropOpen(true)
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
            	if (err?.response?.status === 404) {
            		navigate(`/notexist?err=${err?.response?.data?.detail}`)
            	} else {
                	console.log(err)
            	}
            } finally {
            	setBackdropOpen(false)
            }
        }

        getQuest()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [commentChanged])

	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		<div className="mt-3">
            <Button component={Link} to="/" variant="text" size="large">&lt;&lt; Back</Button>
            <Card className="mt-3">
                <CardContent>
                    <Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">{quest.name}</Typography>
                    {quest.photo
                        ? (
                            <Box className="figure w-50 float-end m-3">
                                <Box
                                    component="img"
                                    sx={{
                                        height: 550,
                                        width: 550,
                                        maxHeight: { xs: 200, sm: 400, md: 450, lg: 550 },
                                        maxWidth: { xs: 200, sm: 400, md: 450, lg: 550 },
                                    }}
                                    alt="Photo"
                                    src={quest.photo}
                                    className="figure-img img-fluid rounded img-thumbnail"
                                />
                            </Box>
                        )
                        : null
                    }
                    <Typography gutterBottom variant="body1">{quest.full_description}</Typography>
                    <hr/>
                    <Typography gutterBottom variant="h6">Telegram address: <i>@{quest.telegram_url}</i></Typography>
                    <Button component={Link} to={`/library?tag=${quest.url}`} variant="text">#{quest.url} </Button>
                    <hr/>
                    {quest.quest_comments?.length
						?
						quest.quest_comments.map((comment, i) =>
							<Row key={i} className="mb-3">
								<Col xs={12} md={8}>
									<Paper elevation={3} sx={{ ml: 2, pl: 2, pt: 1, pb: 1 }}>
										<div className="d-flex justify-content-between">
											<Stack direction="row" spacing={2}>
												<div>
													<Avatar alt="User photo" src={comment.user.photo} />
												</div>
												<div>
													<Typography variant="h5">{comment.user.username}</Typography>
													<Typography gutterBottom variant="body2" color="text.secondary">{moment(new Date(comment.created_at)).format('MM/DD/YY HH:mm:ss')}</Typography>
												</div>
											</Stack>
											{auth?.role === 'admin'
												?
												<div>
													<IconButton edge="start" color="error" onClick={() => handleCommentDelete(comment.id)}>
                            							<DeleteForeverIcon />
                            						</IconButton>
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
        </>
	)
}

export default QuestDetails