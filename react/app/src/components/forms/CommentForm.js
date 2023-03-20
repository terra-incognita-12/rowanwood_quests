import { useState } from "react"
import { useLocation } from "react-router-dom"
import Form from "react-bootstrap/Form"

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel'

import useAuth from "../../hooks/useAuth"

import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"
import LoadingBackdrop from "../Backdrop"
import ErrMsg from '../ErrMsg'

const CommentForm = ({ url, handleCommentChanged }) => {
	const [backdropOpen, setBackdropOpen] = useState(false)
	const [comment, setComment] = useState("")
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()
	const redirectLogin = useRedirectLogin(location)

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)
	
	const { auth } = useAuth()

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		setBackdropOpen(true)
		
		e.preventDefault()

		try {
			const response = await axiosPrivate.post("/comment/create", JSON.stringify({"text_comment": comment, "quest_url": url}))

			setComment("")
			handleCommentChanged()
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status) {
				setErrMsg(err?.response?.data?.detail)
			} else {
				setErrMsg("Create Comment Failed")
			}
			handleShowErr(true)
			return
		} finally {
			setBackdropOpen(false)
		}
	}
	return (
		<>
		<LoadingBackdrop open={backdropOpen} />
		<Form onSubmit={handleSubmit}>
			{showErrMsg
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
				: null
			}
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
		</>
	)
}

export default CommentForm