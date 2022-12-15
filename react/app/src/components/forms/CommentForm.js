import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import Form from "react-bootstrap/Form"
// import Button from "react-bootstrap/Button"

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';

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
		<Form onSubmit={handleSubmit}>
  			<FormControl fullWidth>
                <InputLabel htmlFor="comment">Comment</InputLabel>
                <OutlinedInput
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    label="Comment"
                    required
                    multiline
      				rows={6}
                />
            </FormControl>
            <div className="mt-3">
                <Button variant="contained" color="success" type="submit">Send Comment</Button>
            </div>
		</Form>	
	)
}

export default CommentForm