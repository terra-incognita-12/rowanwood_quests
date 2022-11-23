import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import FloatingLabel from "react-bootstrap/FloatingLabel"
import Button from "react-bootstrap/Button"

import useAxiosPrivate from "../../hooks/useAxiosPrivate"

const CommentForm = ({ url }) => {
	const axiosPrivate = useAxiosPrivate()
	const [comment, setComment] = useState("")

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const response = await axiosPrivate.post("/comment/create", JSON.stringify({"text_comment": comment, "quest_url": url}))

			setComment("")
			return
		} catch (err) {
			console.log(err)
		}
	}
	return (
		<>
			<Form onSubmit={handleSubmit}>
				<FloatingLabel controlId="floatingTextarea" label="Your comment">
        			<Form.Control 
        				as="textarea" 
        				placeholder="Leave a comment here"
        				onChange={(e) => setComment(e.target.value)}
        				value={comment} 
        			/>
      			</FloatingLabel>
      			<Button variant="success" className="mt-2" as="input" type="submit" value="Leave comment" />
			</Form>	
		</>
	)
}

export default CommentForm