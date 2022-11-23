import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Card from "react-bootstrap/Card"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import axios from "../../api/axios"
import CommentForm from "../forms/CommentForm"

const QuestInfo = ({ url }) => {
	const [quest, setQuest] = useState("")

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuest = async () => {
            
            try {
                const response = await axios.get(`/quest/${url}`, {
                    signal: controller.signal
                })
                isMounted && setQuest(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getQuest()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

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
									<Card.Header><b>{comment.user.username}</b> on {comment.created_at}</Card.Header>
									<p>{comment.text_comment}</p>
								</Card>	
							</Col>
						</Row>
					) : <p>No comments yet!</p>
				}
				<Row className="mt-3">
					<Col xs={12} md={8}>
						<CommentForm url={url} />
					</Col>
				</Row>
			</div>
		</>
	)
}

export default QuestInfo