import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Form from "react-bootstrap/Form"
import FloatingLabel from "react-bootstrap/FloatingLabel"
import Button from "react-bootstrap/Button"

import useAxiosPrivate from "../../hooks/useAxiosPrivate"

const CommentForm = ({ url, handleCommentChanged }) => {
	const [comment, setComment] = useState("")
	const axiosPrivate = useAxiosPrivate()
	const navigate = useNavigate()  
    const location = useLocation()

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			await axiosPrivate.post("/comment/create", JSON.stringify({"text_comment": comment, "quest_url": url}))

			setComment("")
			handleCommentChanged()
		} catch (err) {
			navigate('/login', { state: { from: location }, replace: true })
		}
	}
	return (
		<>
			<Form onSubmit={handleSubmit}>
    			<Form.Control 
    				as="textarea" 
    				placeholder="Leave a comment here"
    				onChange={(e) => setComment(e.target.value)}
    				value={comment} 
    			/>
      			<Button variant="success" className="mt-2" as="input" type="submit" value="Leave comment" />
			</Form>	
		</>
	)
}

export default CommentForm