import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import Card from "react-bootstrap/Card"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import moment from 'moment'

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
			setCommentChanged(true)
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
		<>
			<div className="text-center mt-5">
				<h1>{quest?.name}</h1>
			</div>
			<div className="">
				<h4><i>Telegram link:</i> <b>@{quest?.url}</b></h4> 
			</div>
			<div className="mt-3">
				<p>{quest?.full_description}</p>
			</div>
			<Link to="/" className="text-decoration-none">#{quest?.url}</Link>
			<hr/>
			<div className="mt-3">
				{quest?.quest_comments?.length
					?
					quest.quest_comments.map((comment, i) =>
						<Row key={i}>
							<Col xs={12} md={8}>
								<Card>
									<Card.Header className="d-flex justify-content-between">
										<div>
											<Card.Title>{comment.user.username}</Card.Title>
											<Card.Subtitle className="text-muted">{moment(new Date(comment.created_at)).format('MM/DD/YY HH:mm:ss')}</Card.Subtitle>
										</div>
										<div>
											{auth?.role === 'admin'
												?
												<Button variant="danger" size="sm" onClick={() => handleCommentDelete(comment.id)}>Delete</Button>
												: null
											}
										</div>
									</Card.Header>
									<p>{comment.text_comment}</p>
								</Card>	
							</Col>
						</Row>
					) : <p>No comments yet!</p>
				}
				<Row className="mt-3">
					<Col xs={12} md={8}>
						{auth?.user
							? <CommentForm url={url} handleCommentChanged={handleCommentChanged} />
							: <h4>Sign in to leave comments</h4>
						}
					</Col>
				</Row>
			</div>
		</>
	)
}

export default QuestInfo