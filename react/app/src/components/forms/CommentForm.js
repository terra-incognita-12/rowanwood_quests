import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"

import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const CommentForm = ({ url, handleCommentChanged }) => {
	const [comment, setComment] = useState("")
    const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			await axiosPrivate.post("/comment/create", JSON.stringify({"text_comment": comment, "quest_url": url}))

			setComment("")
			handleCommentChanged()
		} catch (err) {
			redirectLogin()
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